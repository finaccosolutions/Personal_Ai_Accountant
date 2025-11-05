import { useEffect, useState } from 'react';
import { Wallet, Edit2, CheckCircle, XCircle, Sparkles, Loader, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { suggestLedgerWithGemini } from '../../lib/gemini';

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  narration: string | null;
  amount: number;
  transaction_type: string;
  is_reconciled: boolean;
  banks: { bank_name: string } | null;
}

interface Ledger {
  id: string;
  name: string;
  category: string;
}

export const TransactionsView = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [ledgerName, setLedgerName] = useState('');
  const [ledgerCategory, setLedgerCategory] = useState('Expense');
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [showNewLedgerForm, setShowNewLedgerForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', user?.id)
      .maybeSingle();

    if (profileData?.gemini_api_key) {
      setGeminiApiKey(profileData.gemini_api_key);
    }

    const { data: txnData } = await supabase
      .from('transactions')
      .select('*, banks(bank_name)')
      .eq('user_id', user?.id)
      .eq('is_reconciled', false)
      .order('transaction_date', { ascending: false });

    const { data: ledgerData } = await supabase
      .from('ledgers')
      .select('id, name, category')
      .eq('user_id', user?.id);

    if (txnData) setTransactions(txnData);
    if (ledgerData) setLedgers(ledgerData);

    setLoading(false);
  };

  const handleSelectTransaction = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNarration(transaction.narration || '');
    setAiSuggestion(null);

    if (geminiApiKey) {
      setProcessing(true);
      try {
        const suggestion = await suggestLedgerWithGemini(
          geminiApiKey,
          transaction.description || '',
          transaction.amount,
          transaction.transaction_type,
          ledgers.map((l) => l.name)
        );
        setAiSuggestion(suggestion);
        setLedgerName(suggestion.ledgerName);
        setLedgerCategory(suggestion.category);
        setNarration(suggestion.narration);
      } catch (error) {
        console.error('AI suggestion failed:', error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleSaveTransaction = async () => {
    if (!selectedTransaction || !ledgerName) {
      alert('Please fill all required fields');
      return;
    }

    setProcessing(true);

    try {
      let ledgerId = ledgers.find((l) => l.name === ledgerName)?.id;

      if (!ledgerId) {
        const { data: newLedger, error: ledgerError } = await supabase
          .from('ledgers')
          .insert({
            user_id: user?.id,
            name: ledgerName,
            category: ledgerCategory,
            is_system: false,
          })
          .select()
          .single();

        if (ledgerError) throw ledgerError;
        ledgerId = newLedger.id;
        setLedgers([...ledgers, newLedger]);
      }

      await supabase
        .from('transactions')
        .update({
          narration,
          is_reconciled: true,
        })
        .eq('id', selectedTransaction.id);

      await supabase.from('transaction_ledger_entries').insert({
        transaction_id: selectedTransaction.id,
        ledger_id: ledgerId,
        entry_type: selectedTransaction.transaction_type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
        amount: selectedTransaction.amount,
      });

      const existingMapping = await supabase
        .from('transaction_mappings')
        .select('id, usage_count')
        .eq('user_id', user?.id)
        .eq('description_pattern', selectedTransaction.description)
        .maybeSingle();

      if (existingMapping.data) {
        await supabase
          .from('transaction_mappings')
          .update({
            usage_count: existingMapping.data.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existingMapping.data.id);
      } else {
        await supabase.from('transaction_mappings').insert({
          user_id: user?.id,
          description_pattern: selectedTransaction.description,
          suggested_ledger_id: ledgerId,
          suggested_narration: narration,
          confidence_score: aiSuggestion?.confidence || 0.5,
        });
      }

      setSelectedTransaction(null);
      setLedgerName('');
      setNarration('');
      setAiSuggestion(null);
      loadData();
    } catch (error: any) {
      alert('Error saving transaction: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Transactions</h1>
        <p className="text-gray-600">Categorize and confirm your transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Wallet className="w-6 h-6 mr-2 text-blue-600" />
            Pending Transactions ({transactions.length})
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600">All transactions are categorized!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleSelectTransaction(transaction)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTransaction?.id === transaction.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(transaction.transaction_date).toLocaleDateString()} •{' '}
                        {transaction.banks?.bank_name || 'Cash'}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transaction.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.transaction_type === 'CREDIT' ? '+' : '-'}$
                      {transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {selectedTransaction ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Edit2 className="w-6 h-6 mr-2 text-blue-600" />
                Categorize Transaction
              </h2>

              {processing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center">
                  <Loader className="w-5 h-5 animate-spin text-blue-600 mr-3" />
                  <span className="text-blue-800">AI is analyzing transaction...</span>
                </div>
              )}

              {aiSuggestion && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-900">AI Suggestion</span>
                    <span className="ml-auto text-sm text-purple-700">
                      {(aiSuggestion.confidence * 100).toFixed(0)}% confident
                    </span>
                  </div>
                  <p className="text-sm text-purple-800">
                    Ledger: <strong>{aiSuggestion.ledgerName}</strong> ({aiSuggestion.category})
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Details</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">{selectedTransaction.description}</p>
                    <p className="text-lg font-bold mt-1">
                      ${selectedTransaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ledger / Account <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={ledgerName}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '__new__') {
                          setShowNewLedgerForm(true);
                          setLedgerName('');
                        } else {
                          setLedgerName(value);
                          const ledger = ledgers.find((l) => l.name === value);
                          if (ledger) setLedgerCategory(ledger.category);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select or create ledger</option>
                      {ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.name}>
                          {ledger.name} ({ledger.category})
                        </option>
                      ))}
                      <option value="__new__">+ Create New Ledger</option>
                    </select>
                  </div>
                </div>

                {showNewLedgerForm && (
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Ledger Name</label>
                      <input
                        type="text"
                        value={ledgerName}
                        onChange={(e) => setLedgerName(e.target.value)}
                        placeholder="e.g., Office Supplies"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={ledgerCategory}
                        onChange={(e) => setLedgerCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                        <option value="Equity">Equity</option>
                      </select>
                    </div>
                    <button
                      onClick={() => setShowNewLedgerForm(false)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Narration / Notes</label>
                  <textarea
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    rows={3}
                    placeholder="Add a clear description of this transaction"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveTransaction}
                    disabled={processing || !ledgerName}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirm & Save
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTransaction(null);
                      setLedgerName('');
                      setNarration('');
                      setShowNewLedgerForm(false);
                    }}
                    className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Edit2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Select a transaction to categorize</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

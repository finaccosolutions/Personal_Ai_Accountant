import { useEffect, useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Check, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TransactionDetailModal } from './TransactionDetailModal';

interface Bank {
  id: string;
  bank_name: string;
  account_number: string | null;
  current_balance: number;
}

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  narration: string | null;
  is_confirmed: boolean;
  ledgers: {
    name: string;
    type: string;
  } | null;
}

interface BankDetailModalProps {
  bank: Bank;
  onClose: () => void;
  onUpdate: () => void;
}

export const BankDetailModal = ({ bank, onClose, onUpdate }: BankDetailModalProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [bank.id]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, ledgers(name, type)')
        .eq('bank_id', bank.id)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{bank.bank_name}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {bank.account_number && (
              <p className="text-sm text-gray-500 mb-3">Account: ****{bank.account_number.slice(-4)}</p>
            )}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Current Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(bank.current_balance)}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions found</p>
                <p className="text-sm mt-2">Upload a bank statement to add transactions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx)}
                    className="w-full bg-gray-50 rounded-2xl p-4 active:scale-95 transition-transform text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                          tx.transaction_type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.transaction_type === 'credit' ? (
                            <ArrowDownCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-800 text-sm">{tx.description}</p>
                            <p className={`font-bold ${
                              tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(tx.transaction_date)}</p>
                          {tx.ledgers && (
                            <div className="flex items-center mt-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                {tx.ledgers.name}
                              </span>
                              {tx.is_confirmed && (
                                <Check className="w-4 h-4 text-green-600 ml-2" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Edit2 className="w-4 h-4 text-gray-400 ml-2 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={() => {
            fetchTransactions();
            onUpdate();
          }}
        />
      )}
    </>
  );
};

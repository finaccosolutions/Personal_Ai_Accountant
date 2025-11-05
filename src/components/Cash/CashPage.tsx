import { useEffect, useState } from 'react';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddCashTransactionModal } from './AddCashTransactionModal';
import { TransactionDetailModal } from '../Banks/TransactionDetailModal';

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  narration: string | null;
  is_confirmed: boolean;
  ledger_id: string;
  ledgers: {
    name: string;
    type: string;
  } | null;
}

export const CashPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, ledgers(name, type)')
        .eq('user_id', user!.id)
        .eq('is_cash', true)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);

      let balance = 0;
      data?.forEach((tx: any) => {
        if (tx.transaction_type === 'credit') {
          balance += tx.amount;
        } else {
          balance -= tx.amount;
        }
      });
      setCashBalance(balance);
    } catch (error) {
      console.error('Error fetching cash transactions:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cash Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your cash expenses and income</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <Wallet className="w-8 h-8 opacity-90" />
          <span className="text-sm font-medium opacity-90">Cash in Hand</span>
        </div>
        <p className="text-4xl font-bold mb-6">{formatCurrency(cashBalance)}</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-white text-green-600 py-4 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Cash Transaction
        </button>
      </div>

      <div>
        <h2 className="font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Cash Transactions Yet</h3>
            <p className="text-gray-500 text-sm mb-6">
              Start recording your cash expenses and income
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="w-full bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform text-left"
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
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                            {tx.ledgers.name}
                          </span>
                        </div>
                      )}
                      {tx.narration && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{tx.narration}</p>
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

      {showAddModal && (
        <AddCashTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTransactions();
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={fetchTransactions}
        />
      )}
    </div>
  );
};

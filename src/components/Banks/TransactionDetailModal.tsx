import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Ledger {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  narration: string | null;
  is_confirmed: boolean;
  ledger_id: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: () => void;
}

export const TransactionDetailModal = ({ transaction, onClose, onUpdate }: TransactionDetailModalProps) => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [selectedLedgerId, setSelectedLedgerId] = useState(transaction.ledger_id);
  const [narration, setNarration] = useState(transaction.narration || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select('*')
        .or(`user_id.eq.${user!.id},is_system.eq.true`)
        .order('name');

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          ledger_id: selectedLedgerId,
          narration: narration || null,
          is_confirmed: true,
        })
        .eq('id', transaction.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="font-medium text-gray-800">{transaction.description}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Amount</p>
              <p className={`font-bold text-lg ${
                transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.transaction_type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-medium text-gray-800">
                {new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            >
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name} ({ledger.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Narration / Notes
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
              rows={3}
              placeholder="Add notes about this transaction"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

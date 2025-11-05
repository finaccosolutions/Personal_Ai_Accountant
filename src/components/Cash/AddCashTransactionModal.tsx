import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Ledger {
  id: string;
  name: string;
  type: string;
}

export const AddCashTransactionModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const { user } = useAuth();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('debit');
  const [selectedLedgerId, setSelectedLedgerId] = useState('');
  const [narration, setNarration] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (data && data.length > 0) {
        setSelectedLedgerId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user!.id,
          transaction_date: transactionDate,
          description,
          amount: parseFloat(amount),
          transaction_type: transactionType,
          ledger_id: selectedLedgerId,
          narration: narration || null,
          is_cash: true,
          is_confirmed: true,
        });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Add Cash Transaction</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
            <button
              type="button"
              onClick={() => setTransactionType('debit')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                transactionType === 'debit'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('credit')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                transactionType === 'credit'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none"
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedLedgerId}
              onChange={(e) => setSelectedLedgerId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none"
              required
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
              Notes (Optional)
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all outline-none resize-none"
              rows={3}
              placeholder="Add any notes about this transaction"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

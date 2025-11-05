import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AddReminderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddReminderModal = ({ onClose, onSuccess }: AddReminderModalProps) => {
  const { user } = useAuth();
  const [reminderType, setReminderType] = useState<'receivable' | 'payable'>('receivable');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [sendVia, setSendVia] = useState<'sms' | 'whatsapp' | 'email' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('reminders')
        .insert({
          user_id: user!.id,
          reminder_date: reminderDate,
          amount: parseFloat(amount),
          message,
          reminder_type: reminderType,
          status: 'pending',
          send_via: sendVia || null,
        });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Create Reminder</h2>
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
              onClick={() => setReminderType('receivable')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                reminderType === 'receivable'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              To Receive
            </button>
            <button
              type="button"
              onClick={() => setReminderType('payable')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                reminderType === 'payable'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600'
              }`}
            >
              To Pay
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
              rows={3}
              placeholder="e.g., Payment for monthly rent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Date
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Via (Optional)
            </label>
            <select
              value={sendVia}
              onChange={(e) => setSendVia(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            >
              <option value="">Don't send automatically</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
            </select>
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
              className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

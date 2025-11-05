import { useEffect, useState } from 'react';
import { Plus, Bell, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddReminderModal } from './AddReminderModal';

interface Reminder {
  id: string;
  reminder_date: string;
  amount: number;
  message: string;
  reminder_type: 'receivable' | 'payable';
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  send_via: 'sms' | 'whatsapp' | 'email' | null;
  sent_at: string | null;
  created_at: string;
}

export const RemindersPage = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user, filter]);

  const fetchReminders = async () => {
    try {
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user!.id)
        .order('reminder_date', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReminderStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
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
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date() && new Date(dateString).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reminders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage payment reminders</p>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center mb-6"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Reminder
      </button>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'sent', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reminders</h3>
          <p className="text-gray-500 text-sm mb-6">
            Create reminders for payments to receive or make
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const overdue = isOverdue(reminder.reminder_date) && reminder.status === 'pending';
            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-2xl p-4 shadow-md ${
                  overdue ? 'border-2 border-red-300' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                      reminder.reminder_type === 'receivable' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <Bell className={`w-5 h-5 ${
                        reminder.reminder_type === 'receivable' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          reminder.reminder_type === 'receivable'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {reminder.reminder_type === 'receivable' ? 'To Receive' : 'To Pay'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          reminder.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : reminder.status === 'sent'
                            ? 'bg-blue-100 text-blue-700'
                            : reminder.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-bold text-lg text-gray-800 mb-1">
                        {formatCurrency(reminder.amount)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{reminder.message}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          {formatDate(reminder.reminder_date)}
                          {overdue && ' (Overdue)'}
                        </span>
                        {reminder.send_via && (
                          <>
                            <Send className="w-3 h-3 ml-3 mr-1" />
                            <span>{reminder.send_via}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {reminder.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateReminderStatus(reminder.id, 'completed')}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl font-medium text-sm active:scale-95 transition-transform flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </button>
                    <button
                      onClick={() => updateReminderStatus(reminder.id, 'cancelled')}
                      className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-xl font-medium text-sm active:scale-95 transition-transform flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddReminderModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchReminders();
          }}
        />
      )}
    </div>
  );
};

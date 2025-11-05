import { useEffect, useState } from 'react';
import { Plus, Building2, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_type: string;
  current_balance: number;
  currency: string;
  is_active: boolean;
}

export const BanksView = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_type: 'Savings',
    current_balance: '0',
    currency: 'USD',
  });

  useEffect(() => {
    if (user) {
      loadBanks();
    }
  }, [user]);

  const loadBanks = async () => {
    const { data } = await supabase
      .from('banks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setBanks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBank) {
      await supabase
        .from('banks')
        .update({
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_type: formData.account_type,
          current_balance: parseFloat(formData.current_balance),
          currency: formData.currency,
        })
        .eq('id', editingBank.id);
    } else {
      await supabase.from('banks').insert({
        user_id: user?.id,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_type: formData.account_type,
        current_balance: parseFloat(formData.current_balance),
        currency: formData.currency,
        is_active: true,
      });
    }

    setFormData({
      bank_name: '',
      account_number: '',
      account_type: 'Savings',
      current_balance: '0',
      currency: 'USD',
    });
    setShowForm(false);
    setEditingBank(null);
    loadBanks();
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      bank_name: bank.bank_name,
      account_number: bank.account_number,
      account_type: bank.account_type,
      current_balance: bank.current_balance.toString(),
      currency: bank.currency,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bank account?')) {
      await supabase.from('banks').delete().eq('id', id);
      loadBanks();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Banks</h1>
          <p className="text-gray-600">Add and manage your bank accounts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingBank(null);
            setFormData({
              bank_name: '',
              account_number: '',
              account_type: 'Savings',
              current_balance: '0',
              currency: 'USD',
            });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Bank</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Chase Bank"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last 4 digits"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div className="flex items-end space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBank ? 'Update' : 'Add'} Bank
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBank(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(bank)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bank.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{bank.bank_name}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {bank.account_type} • ****{bank.account_number}
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {bank.currency} {Number(bank.current_balance).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {banks.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No banks added yet</h3>
          <p className="text-gray-600 mb-6">Add your first bank account to start tracking transactions</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Bank</span>
          </button>
        </div>
      )}
    </div>
  );
};

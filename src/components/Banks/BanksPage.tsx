import { useEffect, useState } from 'react';
import { Plus, Upload, Landmark, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AddBankModal } from './AddBankModal';
import { BankDetailModal } from './BankDetailModal';
import { UploadStatementModal } from './UploadStatementModal';

interface Bank {
  id: string;
  bank_name: string;
  account_number: string | null;
  account_type: string;
  current_balance: number;
}

export const BanksPage = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  useEffect(() => {
    if (user) {
      fetchBanks();
    }
  }, [user]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
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

  const handleBankClick = (bank: Bank) => {
    setSelectedBank(bank);
    setShowDetailModal(true);
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
        <h1 className="text-2xl font-bold text-gray-800">Bank Accounts</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your bank transactions</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Bank
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={banks.length === 0}
          className="flex-1 bg-white border-2 border-blue-500 text-blue-600 py-4 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Statement
        </button>
      </div>

      {banks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Landmark className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Banks Added Yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Add your first bank account to start tracking transactions
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
          >
            Add Your First Bank
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleBankClick(bank)}
              className="w-full bg-white rounded-2xl p-5 shadow-md active:scale-95 transition-transform text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{bank.bank_name}</h3>
                    {bank.account_number && (
                      <p className="text-sm text-gray-500 mt-1">
                        {bank.account_type} - ****{bank.account_number.slice(-4)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {formatCurrency(bank.current_balance)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddBankModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchBanks();
          }}
        />
      )}

      {showUploadModal && (
        <UploadStatementModal
          banks={banks}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchBanks();
          }}
        />
      )}

      {showDetailModal && selectedBank && (
        <BankDetailModal
          bank={selectedBank}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBank(null);
          }}
          onUpdate={fetchBanks}
        />
      )}
    </div>
  );
};

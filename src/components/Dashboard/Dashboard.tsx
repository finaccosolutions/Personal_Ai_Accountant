import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Landmark, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  totalReceivables: number;
  totalPayables: number;
  bankBalance: number;
  cashBalance: number;
  bankCount: number;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    totalReceivables: 0,
    totalPayables: 0,
    bankBalance: 0,
    cashBalance: 0,
    bankCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const { data: banks } = await supabase
        .from('banks')
        .select('current_balance')
        .eq('user_id', user!.id);

      const bankBalance = banks?.reduce((sum, bank) => sum + bank.current_balance, 0) || 0;
      const bankCount = banks?.length || 0;

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type, is_cash, ledger_id, ledgers(type)')
        .eq('user_id', user!.id)
        .eq('is_confirmed', true);

      let totalIncome = 0;
      let totalExpense = 0;
      let totalReceivables = 0;
      let totalPayables = 0;
      let cashBalance = 0;

      transactions?.forEach((tx: any) => {
        if (tx.is_cash) {
          if (tx.transaction_type === 'credit') {
            cashBalance += tx.amount;
          } else {
            cashBalance -= tx.amount;
          }
        }

        if (tx.ledgers?.type === 'income') {
          totalIncome += tx.amount;
        } else if (tx.ledgers?.type === 'expense') {
          totalExpense += tx.amount;
        } else if (tx.ledgers?.type === 'receivable') {
          totalReceivables += tx.amount;
        } else if (tx.ledgers?.type === 'payable') {
          totalPayables += tx.amount;
        }
      });

      setStats({
        totalIncome,
        totalExpense,
        totalReceivables,
        totalPayables,
        bankBalance,
        cashBalance,
        bankCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your financial overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Landmark className="w-6 h-6 opacity-80" />
            <span className="text-sm font-medium opacity-90">{stats.bankCount} Banks</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Bank Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.bankBalance)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-6 h-6 opacity-80" />
            <span className="text-sm font-medium opacity-90">Cash</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Cash Balance</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.cashBalance)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Income & Expenses
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="font-semibold text-gray-800">{formatCurrency(stats.totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="font-semibold text-gray-800">{formatCurrency(stats.totalExpense)}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Net Balance</p>
              <p className={`font-bold text-lg ${stats.totalIncome - stats.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.totalIncome - stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Pending Payments
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">To Receive</p>
                <p className="font-semibold text-gray-800">{formatCurrency(stats.totalReceivables)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">To Pay</p>
                <p className="font-semibold text-gray-800">{formatCurrency(stats.totalPayables)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

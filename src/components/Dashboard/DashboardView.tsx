import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Users, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalReceivables: number;
  totalPayables: number;
  transactionCount: number;
}

export const DashboardView = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalReceivables: 0,
    totalPayables: 0,
    transactionCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);

    const { data: banks } = await supabase
      .from('banks')
      .select('current_balance')
      .eq('user_id', user?.id)
      .eq('is_active', true);

    const totalBalance = banks?.reduce((sum, bank) => sum + Number(bank.current_balance), 0) || 0;

    const { data: contacts } = await supabase
      .from('contacts')
      .select('total_receivable, total_payable')
      .eq('user_id', user?.id);

    const totalReceivables = contacts?.reduce((sum, c) => sum + Number(c.total_receivable), 0) || 0;
    const totalPayables = contacts?.reduce((sum, c) => sum + Number(c.total_payable), 0) || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, transaction_type, transaction_date')
      .eq('user_id', user?.id)
      .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions?.forEach((t) => {
      const amount = Number(t.amount);
      if (t.transaction_type === 'CREDIT' || t.transaction_type === 'CASH_IN') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    });

    const { data: recent } = await supabase
      .from('transactions')
      .select('*, banks(bank_name)')
      .eq('user_id', user?.id)
      .order('transaction_date', { ascending: false })
      .limit(5);

    setStats({
      totalBalance,
      totalIncome,
      totalExpense,
      totalReceivables,
      totalPayables,
      transactionCount: transactions?.length || 0,
    });

    setRecentTransactions(recent || []);
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">${value.toLocaleString()}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your financial overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Wallet}
          title="Total Balance"
          value={stats.totalBalance}
          subtitle="Across all accounts"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Income (30 days)"
          value={stats.totalIncome}
          subtitle={`${stats.transactionCount} transactions`}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={TrendingDown}
          title="Expenses (30 days)"
          value={stats.totalExpense}
          subtitle="Track your spending"
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          icon={Users}
          title="Receivables"
          value={stats.totalReceivables}
          subtitle="Amount to collect"
          color="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <StatCard
          icon={AlertCircle}
          title="Payables"
          value={stats.totalPayables}
          subtitle="Amount to pay"
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          icon={Calendar}
          title="Net Cash Flow"
          value={stats.totalIncome - stats.totalExpense}
          subtitle="Last 30 days"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Upload a bank statement to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {transaction.narration || transaction.description || 'Unnamed Transaction'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleDateString()} •{' '}
                    {transaction.banks?.bank_name || 'Cash'}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.transaction_type === 'CREDIT' || transaction.transaction_type === 'CASH_IN'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.transaction_type === 'CREDIT' || transaction.transaction_type === 'CASH_IN'
                      ? '+'
                      : '-'}
                    ${Number(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

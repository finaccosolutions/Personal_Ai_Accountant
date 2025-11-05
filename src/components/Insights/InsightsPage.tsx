import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, PieChart, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CategoryTotal {
  category: string;
  amount: number;
  type: string;
}

export const InsightsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [topExpenses, setTopExpenses] = useState<CategoryTotal[]>([]);
  const [topIncome, setTopIncome] = useState<CategoryTotal[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, transaction_type, ledger_id, ledgers(name, type)')
        .eq('user_id', user!.id)
        .eq('is_confirmed', true)
        .gte('transaction_date', startOfMonth)
        .lte('transaction_date', endOfMonth);

      if (transactions) {
        const categoryTotals: { [key: string]: { amount: number; type: string } } = {};
        let incomeTotal = 0;
        let expenseTotal = 0;

        transactions.forEach((tx: any) => {
          const categoryName = tx.ledgers?.name || 'Uncategorized';
          const categoryType = tx.ledgers?.type || 'other';

          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = { amount: 0, type: categoryType };
          }

          categoryTotals[categoryName].amount += tx.amount;

          if (categoryType === 'income') {
            incomeTotal += tx.amount;
          } else if (categoryType === 'expense') {
            expenseTotal += tx.amount;
          }
        });

        const expenses = Object.entries(categoryTotals)
          .filter(([_, data]) => data.type === 'expense')
          .map(([category, data]) => ({ category, amount: data.amount, type: data.type }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        const income = Object.entries(categoryTotals)
          .filter(([_, data]) => data.type === 'income')
          .map(([category, data]) => ({ category, amount: data.amount, type: data.type }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        setTopExpenses(expenses);
        setTopIncome(income);
        setMonthlyIncome(incomeTotal);
        setMonthlyExpense(expenseTotal);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
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

  const getPercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((amount / total) * 100);
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
        <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
        <p className="text-gray-500 text-sm mt-1 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <TrendingUp className="w-6 h-6 opacity-80 mb-3" />
          <p className="text-sm opacity-90 mb-1">Total Income</p>
          <p className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
          <TrendingDown className="w-6 h-6 opacity-80 mb-3" />
          <p className="text-sm opacity-90 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(monthlyExpense)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Net Balance</h2>
          <PieChart className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">This Month</p>
          <p className={`text-3xl font-bold ${monthlyIncome - monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(monthlyIncome - monthlyExpense)}
          </p>
        </div>
        {monthlyExpense > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Savings Rate</span>
              <span className="font-semibold text-blue-600">
                {getPercentage(monthlyIncome - monthlyExpense, monthlyIncome)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {topExpenses.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            Top Expenses
          </h2>
          <div className="space-y-3">
            {topExpenses.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(item.amount, monthlyExpense)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topIncome.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Income Sources
          </h2>
          <div className="space-y-3">
            {topIncome.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${getPercentage(item.amount, monthlyIncome)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monthlyExpense > monthlyIncome && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800 mb-1">
              Spending Alert
            </p>
            <p className="text-xs text-orange-700">
              Your expenses this month exceed your income by {formatCurrency(monthlyExpense - monthlyIncome)}.
              Consider reviewing your spending.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

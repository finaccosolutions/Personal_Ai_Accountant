import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, Sparkles, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getFinancialInsights } from '../../lib/gemini';

export const ReportsView = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, period]);

  const loadData = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', user?.id)
      .maybeSingle();

    if (profileData?.gemini_api_key) {
      setGeminiApiKey(profileData.gemini_api_key);
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const { data } = await supabase
      .from('transactions')
      .select('*, transaction_ledger_entries(*, ledgers(name, category))')
      .eq('user_id', user?.id)
      .gte('transaction_date', daysAgo.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false });

    if (data) {
      setTransactions(data);
      analyzeCategorys(data);
    }

    setLoading(false);
  };

  const analyzeCategorys = (txns: any[]) => {
    const categoryMap: Record<string, { total: number; count: number }> = {};

    txns.forEach((txn) => {
      if (txn.transaction_type === 'DEBIT' || txn.transaction_type === 'CASH_OUT') {
        const entries = txn.transaction_ledger_entries || [];
        entries.forEach((entry: any) => {
          const category = entry.ledgers?.category || 'Uncategorized';
          if (!categoryMap[category]) {
            categoryMap[category] = { total: 0, count: 0 };
          }
          categoryMap[category].total += Number(txn.amount);
          categoryMap[category].count += 1;
        });
      }
    });

    const sorted = Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    setCategoryData(sorted);
  };

  const generateInsights = async () => {
    if (!geminiApiKey) {
      alert('Please configure your Gemini API key in Settings');
      return;
    }

    setLoading(true);
    try {
      const periodText = `Last ${period} days`;
      const result = await getFinancialInsights(geminiApiKey, transactions, periodText);
      setInsights(result);
    } catch (error: any) {
      alert('Failed to generate insights: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'CREDIT' || t.transaction_type === 'CASH_IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'DEBIT' || t.transaction_type === 'CASH_OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analysis</h1>
          <p className="text-gray-600">Understand your financial patterns and trends</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <Calendar className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Income</h3>
          <p className="text-3xl font-bold">${totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <Calendar className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Expenses</h3>
          <p className="text-3xl font-bold">${totalExpense.toLocaleString()}</p>
        </div>

        <div
          className={`rounded-xl shadow-lg p-6 text-white ${
            netCashFlow >= 0
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <Calendar className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Net Cash Flow</h3>
          <p className="text-3xl font-bold">
            {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expense by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expense data available</p>
          ) : (
            <div className="space-y-4">
              {categoryData.map((cat, index) => {
                const percentage = (cat.total / totalExpense) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900">${cat.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(1)}% • {cat.count} transactions
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Transactions</span>
              <span className="font-bold text-gray-900">{transactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-green-700">Income Transactions</span>
              <span className="font-bold text-green-900">
                {transactions.filter((t) => t.transaction_type === 'CREDIT' || t.transaction_type === 'CASH_IN').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-red-700">Expense Transactions</span>
              <span className="font-bold text-red-900">
                {transactions.filter((t) => t.transaction_type === 'DEBIT' || t.transaction_type === 'CASH_OUT').length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-700">Average Transaction</span>
              <span className="font-bold text-blue-900">
                ${transactions.length > 0 ? ((totalIncome + totalExpense) / transactions.length).toFixed(2) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-7 h-7 text-purple-600 mr-3" />
              AI Financial Insights
            </h2>
            <p className="text-gray-600 mt-1">Get personalized recommendations from AI</p>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading || !geminiApiKey}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            Generate Insights
          </button>
        </div>

        {insights ? (
          <div className="bg-white rounded-lg p-6 prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800">{insights}</div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Click "Generate Insights" to get AI-powered financial analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

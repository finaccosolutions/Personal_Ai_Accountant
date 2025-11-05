export interface LedgerSuggestion {
  ledgerName: string;
  category: string;
  narration: string;
  confidence: number;
}

export const suggestLedgerWithGemini = async (
  apiKey: string,
  transactionDescription: string,
  amount: number,
  type: string,
  existingLedgers: string[]
): Promise<LedgerSuggestion> => {
  const prompt = `You are an expert accountant helping a small business owner categorize a transaction.

Transaction Details:
- Description: ${transactionDescription}
- Amount: $${amount}
- Type: ${type}

Available Ledger Names (suggest one of these if appropriate, or suggest a new one):
${existingLedgers.join(', ')}

Based on this transaction, suggest:
1. The most appropriate ledger name (use existing if suitable, or suggest a new descriptive name)
2. The category (one of: Asset, Liability, Income, Expense, Equity)
3. A clear, user-friendly narration that explains what this transaction is for
4. Your confidence level (0.0 to 1.0)

Return ONLY a JSON object with this exact structure:
{
  "ledgerName": "ledger name here",
  "category": "category here",
  "narration": "clear narration here",
  "confidence": 0.85
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get suggestion from Gemini AI');
  }

  const data = await response.json();
  const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  return JSON.parse(jsonMatch[0]);
};

export const getFinancialInsights = async (
  apiKey: string,
  transactions: any[],
  period: string
): Promise<string> => {
  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'CREDIT' || t.transaction_type === 'CASH_IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'DEBIT' || t.transaction_type === 'CASH_OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const prompt = `You are a financial advisor providing insights to a small business owner or individual.

Period: ${period}
Total Income: $${totalIncome.toLocaleString()}
Total Expenses: $${totalExpense.toLocaleString()}
Net Cash Flow: $${(totalIncome - totalExpense).toLocaleString()}
Number of Transactions: ${transactions.length}

Top Expense Categories:
${getTopCategories(transactions)}

Provide a brief, actionable financial analysis covering:
1. Overall financial health assessment
2. Spending patterns and trends
3. 2-3 specific recommendations for improvement
4. Any red flags or positive highlights

Keep it conversational and easy to understand for someone without accounting knowledge.
Format with clear sections and bullet points.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get insights from Gemini AI');
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'Unable to generate insights';
};

const getTopCategories = (transactions: any[]): string => {
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((t) => t.transaction_type === 'DEBIT' || t.transaction_type === 'CASH_OUT')
    .forEach((t) => {
      const desc = t.description || t.narration || 'Other';
      categoryMap[desc] = (categoryMap[desc] || 0) + Number(t.amount);
    });

  return Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amount]) => `- ${cat}: $${amount.toLocaleString()}`)
    .join('\n');
};

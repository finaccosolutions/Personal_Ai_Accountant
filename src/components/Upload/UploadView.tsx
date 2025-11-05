import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
}

interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  balance?: number;
  reference?: string;
}

export const UploadView = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);
  const [error, setError] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    if (user) {
      loadBanks();
      loadGeminiKey();
    }
  }, [user]);

  const loadBanks = async () => {
    const { data } = await supabase
      .from('banks')
      .select('id, bank_name, account_number')
      .eq('user_id', user?.id)
      .eq('is_active', true);

    if (data) setBanks(data);
  };

  const loadGeminiKey = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('gemini_api_key')
      .eq('id', user?.id)
      .maybeSingle();

    if (data?.gemini_api_key) {
      setGeminiApiKey(data.gemini_api_key);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, TXT, CSV, or Excel file');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const extractTransactionsWithGemini = async (fileContent: string): Promise<ExtractedTransaction[]> => {
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured. Please add it in Settings.');
    }

    const prompt = `You are a financial transaction extraction expert. Analyze the following bank statement and extract ALL transactions.

For each transaction, provide:
1. date (in YYYY-MM-DD format)
2. description (the transaction description/narration)
3. amount (numeric value without currency symbols)
4. type (CREDIT for money in, DEBIT for money out)
5. balance (account balance after transaction, if available)
6. reference (transaction reference number, if available)

Bank statement content:
${fileContent}

Return the data as a JSON array of transactions. Each transaction should be an object with the fields: date, description, amount, type, balance, reference.
IMPORTANT: Return ONLY the JSON array, no additional text or explanations.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to process with Gemini AI');
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';

    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract transaction data from response');
    }

    return JSON.parse(jsonMatch[0]);
  };

  const handleUpload = async () => {
    if (!file || !selectedBank) {
      setError('Please select a bank and upload a file');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const fileContent = await file.text();
      const transactions = await extractTransactionsWithGemini(fileContent);

      setExtractedTransactions(transactions);

      await supabase.from('uploaded_files').insert({
        user_id: user?.id,
        bank_id: selectedBank,
        file_name: file.name,
        file_type: file.type,
        processed_status: 'COMPLETED',
        transactions_extracted: transactions.length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveTransactions = async () => {
    setProcessing(true);

    try {
      const transactionsToInsert = extractedTransactions.map((t) => ({
        user_id: user?.id,
        bank_id: selectedBank,
        transaction_date: t.date,
        transaction_type: t.type,
        amount: t.amount,
        description: t.description,
        reference_number: t.reference,
        balance_after: t.balance,
        source: 'BANK_UPLOAD',
        is_reconciled: false,
      }));

      const { error: insertError } = await supabase.from('transactions').insert(transactionsToInsert);

      if (insertError) throw insertError;

      setExtractedTransactions([]);
      setFile(null);
      setSelectedBank('');
      alert('Transactions saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save transactions');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Bank Statement</h1>
        <p className="text-gray-600">Upload your bank statement and let AI extract transactions automatically</p>
      </div>

      {!geminiApiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">Gemini API Key Required</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please add your Gemini API key in Settings to enable AI-powered transaction extraction.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={processing}
            >
              <option value="">Choose a bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bank_name} - ****{bank.account_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.txt,.csv,.xls,.xlsx"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={processing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Accepted: PDF, TXT, CSV, Excel</p>
          </div>
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-blue-900 font-medium">{file.name}</p>
              <p className="text-blue-700 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || !selectedBank || processing || !geminiApiKey}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Extract Transactions with AI
            </>
          )}
        </button>
      </div>

      {extractedTransactions.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                {extractedTransactions.length} Transactions Extracted
              </h2>
              <p className="text-gray-600 mt-1">Review and save transactions to your account</p>
            </div>
            <button
              onClick={handleSaveTransactions}
              disabled={processing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Save All Transactions
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {extractedTransactions.map((transaction, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                      {transaction.reference && ` • Ref: ${transaction.reference}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    {transaction.balance && (
                      <p className="text-sm text-gray-500">Balance: ${transaction.balance.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {banks.length === 0 && (
        <div className="mt-8 text-center py-12 bg-white rounded-xl shadow-lg">
          <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Banks Available</h3>
          <p className="text-gray-600">Please add a bank account first to upload statements</p>
        </div>
      )}
    </div>
  );
};

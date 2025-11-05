import { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Bank {
  id: string;
  bank_name: string;
}

interface UploadStatementModalProps {
  banks: Bank[];
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadStatementModal = ({ banks, onClose, onSuccess }: UploadStatementModalProps) => {
  const { user } = useAuth();
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      if (
        fileType === 'application/pdf' ||
        fileType === 'text/csv' ||
        fileType === 'application/vnd.ms-excel' ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileName.endsWith('.txt')
      ) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a valid file (PDF, Excel, CSV, or Text)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedBankId) return;

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('bank_statements')
        .insert({
          user_id: user!.id,
          bank_id: selectedBankId,
          file_name: file.name,
          file_type: file.type || 'text/plain',
          processed: false,
        });

      if (insertError) throw insertError;

      setMessage('Statement uploaded successfully! Processing will happen in the background.');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload statement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upload Bank Statement</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Bank
            </label>
            <select
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              required
            >
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bank_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Statement
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.csv,.xls,.xlsx,.txt"
                className="hidden"
                required
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                {file ? (
                  <div className="flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600 mr-2" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, Excel, CSV, or Text files
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm">
              {message}
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
              disabled={loading || !file}
              className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> The app will automatically extract transactions from your statement.
            AI will suggest appropriate categories and descriptions for each transaction.
          </p>
        </div>
      </div>
    </div>
  );
};

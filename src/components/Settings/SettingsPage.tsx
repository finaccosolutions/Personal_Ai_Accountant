import { useState, useEffect } from 'react';
import { User, Key, LogOut, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [useSystemAi, setUseSystemAi] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setGeminiApiKey(data.gemini_api_key || '');
        setUseSystemAi(data.use_system_ai);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gemini_api_key: geminiApiKey || null,
          use_system_ai: useSystemAi,
        })
        .eq('id', user!.id);

      if (error) throw error;
      setShowApiKeyModal(false);
      fetchProfile();
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">{profile?.full_name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Gemini AI Setup</p>
              <p className="text-xs text-gray-500">
                {geminiApiKey ? 'API Key configured' : 'No API key set'}
              </p>
            </div>
          </div>
          <Key className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
        <button
          onClick={handleSignOut}
          className="w-full px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-medium text-red-600">Sign Out</p>
          </div>
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8">
        <p>Finacco v1.0</p>
        <p className="mt-1">Smart Financial Management</p>
      </div>

      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Gemini AI Setup</h2>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start">
                <Sparkles className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-medium mb-2">How to get your Gemini API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Visit Google AI Studio</li>
                    <li>Sign in with your Google account</li>
                    <li>Click "Get API Key"</li>
                    <li>Copy your key and paste it below</li>
                  </ol>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 text-purple-600 font-medium hover:underline"
                  >
                    Open Google AI Studio
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
                  placeholder="Enter your API key"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Use System AI</p>
                  <p className="text-xs text-gray-500">Use default AI if no key is set</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSystemAi}
                    onChange={(e) => setUseSystemAi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

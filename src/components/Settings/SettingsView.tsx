import { useState, useEffect } from 'react';
import { Settings, Key, Save, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsView = () => {
  const { user } = useAuth();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    whatsapp: false,
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('gemini_api_key, full_name, notification_preferences')
      .eq('id', user?.id)
      .maybeSingle();

    if (data) {
      setGeminiApiKey(data.gemini_api_key || '');
      setFullName(data.full_name || '');
      if (data.notification_preferences) {
        setNotificationPrefs(data.notification_preferences as any);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gemini_api_key: geminiApiKey,
          full_name: fullName,
          notification_preferences: notificationPrefs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account and AI preferences</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 mb-6 border-2 border-purple-200">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Gemini AI Configuration</h2>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">How to Get Your Gemini API Key</h3>
          <ol className="space-y-2 text-sm text-gray-700 mb-4">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Visit{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline inline-flex items-center"
                >
                  Google AI Studio
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Sign in with your Google account</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click "Create API Key" button</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Copy the generated API key and paste it below</span>
            </li>
          </ol>

          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get API Key
          </a>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your Gemini API key"
          />
          <p className="text-xs text-gray-600 mt-2">
            Your API key is stored securely and used for AI-powered transaction analysis and categorization
          </p>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">What Gemini AI Does:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Automatically extracts transactions from bank statements</li>
            <li>• Suggests appropriate ledger categories for transactions</li>
            <li>• Generates clear narrations for better understanding</li>
            <li>• Provides financial insights and recommendations</li>
            <li>• Learns from your patterns to improve suggestions</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive reminders and alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.email}
                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive reminders via text message</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.sms}
                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, sms: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">WhatsApp Notifications</p>
              <p className="text-sm text-gray-600">Receive reminders via WhatsApp</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPrefs.whatsapp}
                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, whatsapp: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center text-lg font-semibold"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-3" />
            Save All Settings
          </>
        )}
      </button>
    </div>
  );
};

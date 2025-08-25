'use client';

import { useState } from 'react';

export default function EmailDebugger() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-email');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-send', email: testEmail })
      });
      
      const data = await response.json();
      setMessage(data.success ? data.message : `Error: ${data.error}`);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const retryFailedEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' })
      });
      
      const data = await response.json();
      setMessage(data.success ? data.message : `Error: ${data.error}`);
      fetchDebugInfo(); // Refresh debug info
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📧 Email System Debugger</h1>
      
      <div className="space-y-4">
        <button
          onClick={fetchDebugInfo}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Check Email System Status'}
        </button>

        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test"
            className="border px-3 py-2 rounded flex-1"
          />
          <button
            onClick={sendTestEmail}
            disabled={loading || !testEmail}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Send Test Email
          </button>
        </div>

        <button
          onClick={retryFailedEmails}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Retry Failed Emails
        </button>

        {message && (
          <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {debugInfo && (
          <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-3">System Status</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
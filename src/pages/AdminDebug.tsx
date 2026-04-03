import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuthMinimal } from '@/contexts/SupabaseAuthContextMinimal';
import { initializeTestData } from '@/lib/testData';

const AdminDebug = () => {
  const { user, loading, isAdmin } = useSupabaseAuthMinimal();
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  const [testData, setTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testDataStatus, setTestDataStatus] = useState<string>('Not initialized');

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('flood_reports').select('count').limit(1);
      
      if (error) {
        console.error('Supabase error:', error);
        setSupabaseStatus(`Error: ${error.message}`);
        setError(error.message);
      } else {
        console.log('Supabase connected successfully');
        setSupabaseStatus('Connected successfully');
        setTestData(data);
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setSupabaseStatus(`Connection failed: ${err}`);
      setError(String(err));
    }
  };

  const handleInitializeTestData = async () => {
    try {
      setTestDataStatus('Initializing...');
      const success = await initializeTestData();
      if (success) {
        setTestDataStatus('Initialized successfully');
      } else {
        setTestDataStatus('Failed to initialize');
      }
    } catch (error) {
      console.error('Error initializing test data:', error);
      setTestDataStatus('Error during initialization');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin Debug Page</h1>
        
        {/* Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
          </div>
        </div>

        {/* Supabase Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Supabase Connection</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {supabaseStatus}</p>
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 rounded">
                <p className="text-red-800"><strong>Error:</strong> {error}</p>
              </div>
            )}
            {testData && (
              <div className="p-4 bg-green-100 border border-green-400 rounded">
                <p className="text-green-800"><strong>Test Data:</strong> {JSON.stringify(testData)}</p>
              </div>
            )}
          </div>
          <button 
            onClick={testSupabaseConnection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Connection
          </button>
        </div>

        {/* Test Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Data</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {testDataStatus}</p>
            <p className="text-sm text-gray-600">
              Initialize test users and reports for admin panel testing
            </p>
          </div>
          <button 
            onClick={handleInitializeTestData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Initialize Test Data
          </button>
        </div>

        {/* Component Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Component Test</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium">Basic Card Test</h3>
              <div className="mt-2 p-4 bg-gray-100 rounded">
                <p>This is a test card component.</p>
              </div>
            </div>
            
            <div className="p-4 border rounded">
              <h3 className="font-medium">Button Test</h3>
              <div className="mt-2 space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">Debug Instructions</h2>
          <div className="space-y-2 text-blue-700">
            <p>1. Check the browser console for any JavaScript errors</p>
            <p>2. Verify Supabase connection status above</p>
            <p>3. Check authentication status</p>
            <p>4. If everything looks good, the issue might be with the main Admin component</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;
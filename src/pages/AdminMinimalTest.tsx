import React from 'react';
import { useSupabaseAuthMinimal } from '@/contexts/SupabaseAuthContextMinimal';

const AdminMinimalTest = () => {
  const { user, loading, isAdmin } = useSupabaseAuthMinimal();
  
  console.log('AdminMinimalTest - user:', user, 'loading:', loading, 'isAdmin:', isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Minimal Admin Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
          </div>
          
          {!user && !loading && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-yellow-800">No user found. Please sign in to Supabase.</p>
              <a 
                href="/admin/signin" 
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Sign In
              </a>
            </div>
          )}
          
          {user && !isAdmin && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <p className="text-red-800">User is not an admin.</p>
            </div>
          )}
          
          {user && isAdmin && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <p className="text-green-800">Admin access confirmed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMinimalTest;
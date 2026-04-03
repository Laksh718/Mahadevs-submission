import React from 'react';

const AdminBasic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Panel</h1>
        <p className="text-gray-600 mb-8">This is a basic admin page to test routing.</p>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Status Check</h2>
            <p className="text-green-600">✅ Page is loading</p>
            <p className="text-green-600">✅ Routing is working</p>
            <p className="text-green-600">✅ React is rendering</p>
          </div>
          
          <div className="space-x-4">
            <a 
              href="/admin-test" 
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Auth Context
            </a>
            <a 
              href="/admin-debug" 
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Debug Page
            </a>
            <a 
              href="/admin-simple" 
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Simple Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBasic;
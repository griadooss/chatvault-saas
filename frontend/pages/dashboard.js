import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchChatSummary();
  }, []);

  const fetchChatSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setFinancialSummary(data); // Reusing the state variable for now
      } else {
        setError('Failed to load chat summary');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ChatVault Dashboard - Chat Management System</title>
        <meta name="description" content="Dashboard for ChatVault - Chat Management and Archival System" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">CV</span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">ChatVault</h1>
                  <p className="text-sm text-gray-600">Chat Management and Archival System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <nav className="flex space-x-4">
                  <a href="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/chats" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Chats
                  </a>
                  <a href="/upload" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Upload
                  </a>
                  <a href="/search" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Search
                  </a>
                </nav>
                <span className="text-sm text-gray-700">Welcome, {user?.name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Chat Summary Cards */}
          {financialSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Chats */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-blue-600 text-xl font-bold">💬</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Chats</p>
                    <p className="text-2xl font-bold text-gray-900">{financialSummary.chats?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Recent Uploads */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <span className="text-green-600 text-xl font-bold">📤</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                    <p className="text-2xl font-bold text-gray-900">{financialSummary.chats?.filter(chat => new Date(chat.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Storage Used */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <span className="text-purple-600 text-xl font-bold">💾</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">{(financialSummary.chats?.length || 0) * 0.1} MB</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          {financialSummary && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Name</p>
                  <p className="text-lg text-gray-900">ChatVault</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User Account</p>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Type</p>
                  <p className="text-lg text-gray-900">{user?.role || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Login</p>
                  <p className="text-lg text-gray-900">
                    {new Date().toLocaleDateString('en-AU')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/upload')}
                className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 text-2xl font-bold">📤</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Upload Chat</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/search')}
                className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-green-600 text-xl font-bold">🔍</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Search Chats</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/management')}
                className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-purple-600 text-xl font-bold">⚙️</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Manage Settings</p>
                </div>
              </button>
            </div>

            {/* Additional Management Section */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/chats')}
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-lg font-bold">💬</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">All Chats</p>
                    <p className="text-xs text-gray-600">View all your chat archives</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/export')}
                  className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-lg font-bold">📤</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Export Chats</p>
                    <p className="text-xs text-gray-600">Export your chat data</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
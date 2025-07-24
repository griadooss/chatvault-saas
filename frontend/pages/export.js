import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Export() {
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [exportFormat, setExportFormat] = useState('all'); // 'all', 'original', 'html'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChats(data.chats || []);
      } else {
        setError('Failed to load chats');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };



  const handleExportSelected = async () => {
    if (selectedChats.length === 0) {
      setError('Please select at least one chat to export');
      return;
    }

    setExporting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chats/export-selected', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatIds: selectedChats,
          format: exportFormat 
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatvault-selected-export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess(`${selectedChats.length} selected chats exported successfully!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Export failed');
      }
    } catch (error) {
      setError('Export error: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChats.length === chats.length) {
      setSelectedChats([]);
    } else {
      setSelectedChats(chats.map(chat => chat.id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Export Chats - ChatVault</title>
        <meta name="description" content="Export your chat data from ChatVault" />
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
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Chats</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Export Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.707 7.293a1 1 0 011.414 0L10 10.586l2.879-2.879a1 1 0 111.414 1.414l-3.586 3.586a1 1 0 01-1.414 0L5.707 8.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Export Successful</h3>
                    <div className="mt-2 text-sm text-green-700">{success}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
              
              {/* Export Selected Chats */}
              {chats.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">Export Chats</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    Select the chats you want to export. Use "Select All" to export everything, or choose specific chats.
                  </p>
                  
                  {/* Export Format Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Export Format:
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      disabled={exporting}
                    >
                      <option value="all">All formats (original + HTML)</option>
                      <option value="original">Original format only</option>
                      <option value="html">HTML format only</option>
                      <option value="markdown">Markdown format only</option>
                    </select>
                    <p className="text-xs text-blue-600 mt-1">
                      {exportFormat === 'all' && "Exports both original files and HTML versions"}
                      {exportFormat === 'original' && "Exports only the original file format (.md, .txt, etc.)"}
                      {exportFormat === 'html' && "Exports only the HTML version (if available)"}
                      {exportFormat === 'markdown' && "Exports content as Markdown (converts HTML to MD)"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleExportSelected}
                      disabled={exporting || selectedChats.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exporting ? 'Exporting...' : `Export Selected (${selectedChats.length})`}
                    </button>
                    <button
                      onClick={handleSelectAll}
                      disabled={exporting}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
                    >
                      {selectedChats.length === chats.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">No Chats to Export</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    Upload some chats first to export them.
                  </p>
                  <button
                    onClick={() => router.push('/upload')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Upload Your First Chat
                  </button>
                </div>
              )}
            </div>

            {chats.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📤</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chats to export</h3>
                <p className="text-gray-500 mb-6">Upload some chats first to export them.</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Upload Your First Chat
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Chat Exports</h3>
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div key={chat.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={selectedChats.includes(chat.id)}
                          onChange={() => handleSelectChat(chat.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{chat.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(chat.chatDate)} • {chat.source?.name || 'Unknown source'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/chats/${chat.id}`)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 ml-4"
                      >
                        View & Export
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Export Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Exports include chat content, metadata, and notes</li>
                <li>• Files are downloaded in their original format</li>
                <li>• Markdown files are also exported as HTML</li>
                <li>• All exports are user-specific and secure</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/chats')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              View All Chats
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 
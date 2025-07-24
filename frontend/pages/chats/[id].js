import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ChatView() {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchChat();
    }
  }, [id]);

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chats/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChat(data);
      } else {
        setError('Failed to load chat');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chats/${id}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.title || 'chat'}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Export failed');
      }
    } catch (error) {
      setError('Export error');
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
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push('/chats')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat not found</h3>
          <p className="text-gray-500 mb-6">The requested chat could not be found.</p>
          <button
            onClick={() => router.push('/chats')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{chat.title} - ChatVault</title>
        <meta name="description" content={`View chat: ${chat.title}`} />
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
          <div className="bg-white rounded-lg shadow">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{chat.title}</h2>
                  {chat.description && (
                    <p className="text-gray-600 mt-1">{chat.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => router.push(`/chats/${id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Metadata */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-900">{formatDate(chat.chatDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Source:</span>
                  <p className="text-gray-900">{chat.source?.name || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-900">{chat.category?.name || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <p className="text-gray-900">{chat.format?.name || '-'}</p>
                </div>
                {chat.project?.name && (
                  <div>
                    <span className="font-medium text-gray-700">Project:</span>
                    <p className="text-gray-900">{chat.project.name}</p>
                  </div>
                )}
                {chat.phase?.name && (
                  <div>
                    <span className="font-medium text-gray-700">Phase:</span>
                    <p className="text-gray-900">{chat.phase.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Content */}
            <div className="px-6 py-4">
              {chat.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-gray-700">{chat.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Content</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {chat.content || 'No content available'}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.push('/chats')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Chats
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 
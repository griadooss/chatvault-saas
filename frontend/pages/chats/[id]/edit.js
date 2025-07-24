import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function EditChat() {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [chatDate, setChatDate] = useState('');

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
        setTitle(data.title || '');
        setDescription(data.description || '');
        setNotes(data.notes || '');
        setChatDate(data.chatDate ? new Date(data.chatDate).toISOString().split('T')[0] : '');
      } else {
        setError('Failed to load chat');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chats/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          notes,
          chatDate: chatDate ? new Date(chatDate).toISOString() : new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Chat updated successfully!');
        setChat(data);
        setTimeout(() => {
          router.push(`/chats/${id}`);
        }, 1500);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
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

  if (error && !chat) {
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
        <title>Edit {chat.title} - ChatVault</title>
        <meta name="description" content={`Edit chat: ${chat.title}`} />
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Chat</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chat title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chat description"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter additional notes"
                />
              </div>

              <div>
                <label htmlFor="chatDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Chat Date
                </label>
                <input
                  type="date"
                  id="chatDate"
                  value={chatDate}
                  onChange={(e) => setChatDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Read-only fields */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Chat Information (Read-only)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div>
                    <span className="font-medium text-gray-700">Project:</span>
                    <p className="text-gray-900">{chat.project?.name || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/chats/${id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 
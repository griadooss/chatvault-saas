import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (term) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (term.trim()) {
            performSearch(term);
          } else {
            setSearchResults([]);
            setLoading(false);
          }
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Perform the actual search
  const performSearch = async (term) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chats?search=${encodeURIComponent(term)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.chats || []);
      } else {
        setError('Search failed');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle form submission (for accessibility)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  return (
    <>
      <Head>
        <title>Search Chats - ChatVault</title>
        <meta name="description" content="Search through your chat archives in ChatVault" />
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
                  <a href="/search" className="text-blue-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Chats</h2>
            
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by title, description, notes, or content..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
              </div>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {loading && searchTerm.trim() && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            )}

            {!loading && searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Search Results ({searchResults.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.map((chat) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{chat.title}</h4>
                          {chat.description && (
                            <p className="text-gray-600 mb-2">{chat.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Date: {formatDate(chat.chatDate)}</span>
                            {chat.source?.name && <span>Source: {chat.source.name}</span>}
                            {chat.category?.name && <span>Category: {chat.category.name}</span>}
                            {chat.format?.name && <span>Format: {chat.format.name}</span>}
                          </div>
                          {chat.notes && (
                            <p className="text-gray-600 mt-2 text-sm">
                              <strong>Notes:</strong> {chat.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => router.push(`/chats/${chat.id}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/chats/${chat.id}/edit`)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && searchTerm.trim() && searchResults.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms or browse all chats.</p>
                <button
                  onClick={() => router.push('/chats')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  View All Chats
                </button>
              </div>
            )}

            {!searchTerm && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search Your Chats</h3>
                <p className="text-gray-500">Enter a search term above to find specific chats in your archive.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 
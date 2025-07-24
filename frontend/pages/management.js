import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Management() {
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchManagementData();
  }, []);

  const fetchManagementData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [sourcesRes, categoriesRes, projectsRes, formatsRes] = await Promise.all([
        fetch('http://localhost:3001/api/management/sources', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/management/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/management/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/management/formats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [sourcesData, categoriesData, projectsData, formatsData] = await Promise.all([
        sourcesRes.json(),
        categoriesRes.json(),
        projectsRes.json(),
        formatsRes.json()
      ]);

      if (sourcesRes.ok) setSources(sourcesData.sources || []);
      if (categoriesRes.ok) setCategories(categoriesData.categories || []);
      if (projectsRes.ok) setProjects(projectsData.projects || []);
      if (formatsRes.ok) setFormats(formatsData.formats || []);
    } catch (error) {
      setError('Failed to load management data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Settings - ChatVault</title>
        <meta name="description" content="Manage ChatVault settings and categories" />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Settings</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chat Sources</h3>
              <div className="space-y-2">
                {sources.map((source) => (
                  <div key={source.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{source.name}</span>
                      {source.description && (
                        <p className="text-sm text-gray-500">{source.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${source.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Projects</h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{project.name}</span>
                      {project.description && (
                        <p className="text-sm text-gray-500">{project.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Formats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Supported File Formats</h3>
              <div className="space-y-2">
                {formats.map((format) => (
                  <div key={format.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{format.name}</span>
                      {format.description && (
                        <p className="text-sm text-gray-500">{format.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${format.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {format.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">About ChatVault Settings</h3>
            <p className="text-blue-700 text-sm">
              These are the default settings for your ChatVault system. You can use these categories, sources, 
              projects, and file formats to organize your chat archives. All settings are user-specific and 
              isolated for security.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 
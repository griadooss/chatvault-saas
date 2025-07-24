import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Management() {
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchManagementData();
  }, []);

  const fetchManagementData = async () => {
    try {
      const [sourcesRes, categoriesRes, projectsRes, formatsRes] = await Promise.all([
        fetch('http://localhost:3001/api/management/sources'),
        fetch('http://localhost:3001/api/management/categories'),
        fetch('http://localhost:3001/api/management/projects'),
        fetch('http://localhost:3001/api/management/formats')
      ]);

      const [sourcesData, categoriesData, projectsData, formatsData] = await Promise.all([
        sourcesRes.json(),
        categoriesRes.json(),
        projectsRes.json(),
        formatsRes.json()
      ]);

      if (sourcesRes.ok) setSources(sourcesData || []);
      if (categoriesRes.ok) setCategories(categoriesData || []);
      if (projectsRes.ok) setProjects(projectsData || []);
      if (formatsRes.ok) setFormats(formatsData || []);
    } catch (error) {
      setError('Failed to load management data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (type) => {
    try {
      const response = await fetch(`http://localhost:3001/api/management/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
        setShowAddForm('');
        setFormData({ name: '', description: '' });
        fetchManagementData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || `Failed to add ${type}`);
      }
    } catch (error) {
      setError('Connection error');
    }
  };

  const handleEdit = async (type, id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/management/${type}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
        setEditingItem(null);
        setFormData({ name: '', description: '' });
        fetchManagementData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || `Failed to update ${type}`);
      }
    } catch (error) {
      setError('Connection error');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/management/${type}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        fetchManagementData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      setError('Connection error');
    }
  };

  const startEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({ name: item.name, description: item.description || '' });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setShowAddForm('');
    setFormData({ name: '', description: '' });
  };

  const renderItem = (item, type) => {
    const isEditing = editingItem && editingItem.id === item.id && editingItem.type === type;
    const isAdding = showAddForm === type && !item.id; // Only show form for empty item when adding

    if (isEditing || isAdding) {
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="space-y-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => isEditing ? handleEdit(type, item.id) : handleAdd(type)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
        <div className="flex-1">
          <span className="font-medium text-gray-900">{item.name}</span>
          {item.description && (
            <p className="text-sm text-gray-500">{item.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => startEdit(item, type)}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(type, item.id)}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (title, items, type) => {
    // Handle special cases for button text
    const getButtonText = (title) => {
      switch (title) {
        case 'Categories':
          return 'Add Category';
        case 'Chat Sources':
          return 'Add Chat Source';
        case 'Supported File Formats':
          return 'Add Supported File Format';
        default:
          return `Add ${title.slice(0, -1)}`;
      }
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={() => setShowAddForm(type)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            {getButtonText(title)}
          </button>
        </div>
        <div className="space-y-2">
          {showAddForm === type && renderItem({}, type)}
          {items.map((item) => renderItem(item, type))}
          {items.length === 0 && showAddForm !== type && (
            <p className="text-gray-500 text-sm italic">No {type} found. Add one to get started.</p>
          )}
        </div>
      </div>
    );
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
                  <a href="/management" className="text-blue-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">
                    Settings
                  </a>
                </nav>
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

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection('Chat Sources', sources, 'sources')}
            {renderSection('Categories', categories, 'categories')}
            {renderSection('Projects', projects, 'projects')}
            {renderSection('Supported File Formats', formats, 'formats')}
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
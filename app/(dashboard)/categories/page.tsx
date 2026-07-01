'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, X, Save, AlertTriangle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  book_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    setDeleteLoading(true);
    try {
      const categoryId = deletingCategory.id;
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        let errorMessage = 'Failed to delete category';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      await fetchCategories();
      showNotification('success', 'Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showNotification('error', error.message || 'Error deleting category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification('error', 'Category name is required');
      return;
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      await fetchCategories();
      showNotification('success', editingCategory ? 'Category updated successfully' : 'Category added successfully');
    } catch (error: any) {
      console.error('Error saving category:', error);
      showNotification('error', error.message || 'Error saving category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white max-w-md animate-slide-in`}>
          {notification.message}
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage your book categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setName('');
            setDescription('');
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-lg">
                  <FolderOpen className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-400">{category.book_count || 0} books</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-400 hover:text-blue-300 transition p-1"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteClick(category)}
                  className="text-red-400 hover:text-red-300 transition p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-gray-400 text-sm">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  setName('');
                  setDescription('');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setName('');
                    setDescription('');
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/50 p-3 rounded-full">
                <AlertTriangle className="text-red-400" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Category</h2>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete the category
            </p>
            <p className="text-white font-semibold text-lg mb-4">
              "{deletingCategory.name}"?
            </p>

            {deletingCategory.book_count > 0 && (
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ This category has {deletingCategory.book_count} book(s) assigned to it.
                  You cannot delete it until you reassign or remove these books.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                disabled={deleteLoading || deletingCategory.book_count > 0}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  deleteLoading || deletingCategory.book_count > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deleteLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Category
                  </>
                )}
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  X, Save, FolderOpen, BookOpen, 
  AlertTriangle, RefreshCw, ChevronLeft,
  ChevronRight, SortAsc, SortDesc,
  ArrowUp, ArrowDown, Calendar, Clock,
  Filter, Package, FolderTree
} from 'lucide-react';
import StatsCards from '@/components/ui/stats-cards';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  description: string;
  book_count: number;
  created_at: string;
  last_updated?: string;
}

type SortOption = 'az' | 'za' | 'most_books' | 'least_books' | 'newest' | 'oldest';

export default function CategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('az');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Summary stats
  const stats = useMemo(() => {
    const totalCategories = filteredCategories.length;
    const categoriesWithBooks = filteredCategories.filter(c => c.book_count > 0).length;
    const emptyCategories = filteredCategories.filter(c => c.book_count === 0).length;
    return { totalCategories, categoriesWithBooks, emptyCategories };
  }, [filteredCategories]);

  // Fetch data
  useEffect(() => {
    fetchCategories();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [categories, search, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      
      // Debug: Log what we received
      console.log('Categories data from API:', data);
      
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...categories];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'most_books':
        result.sort((a, b) => b.book_count - a.book_count);
        break;
      case 'least_books':
        result.sort((a, b) => a.book_count - b.book_count);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    setFilteredCategories(result);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCategories.length);
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate category name
  const validateCategoryName = (name: string, excludeId?: number) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { valid: false, message: 'Category name is required' };
    }
    
    const existing = categories.find(cat => 
      cat.name.toLowerCase() === trimmedName.toLowerCase() && 
      cat.id !== excludeId
    );
    
    if (existing) {
      return { valid: false, message: `Category "${existing.name}" already exists` };
    }
    
    return { valid: true, message: '' };
  };

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const validation = validateCategoryName(trimmedName, editingCategory?.id);
    
    if (!validation.valid) {
      showNotification('error', validation.message);
      return;
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: trimmedName, 
          description: description.trim() || null 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setName('');
      setDescription('');
      setHasUnsavedChanges(false);
      await fetchCategories();
      showNotification('success', editingCategory ? 'Category updated successfully' : 'Category added successfully');
      
    } catch (error: any) {
      console.error('Error saving category:', error);
      showNotification('error', error.message || 'Error saving category');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    // Check if category has books
    if (deletingCategory.book_count > 0) {
      showNotification('error', 
        `Cannot delete "${deletingCategory.name}" because it has ${deletingCategory.book_count} book(s) assigned. Please reassign or remove these books first.`
      );
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
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

  // Modal functions
  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || '');
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  const openViewModal = (category: Category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setHasUnsavedChanges(false);
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    closeModal();
  };

  const handleContinueEditing = () => {
    setShowDiscardModal(false);
  };

  // Format date - with better error handling
  const formatDate = (dateString: string | null | undefined) => {
    console.log('Formatting date:', dateString); // Debug log
    
    if (!dateString) {
      console.log('Date is null or undefined');
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      console.log('Parsed date:', date); // Debug log
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date');
        return 'N/A';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  // Get sort icon
  const getSortIcon = (option: SortOption) => {
    if (sortBy === option) {
      return option === 'az' || option === 'newest' || option === 'most_books' 
        ? <ArrowUp size={14} className="text-blue-400" />
        : <ArrowDown size={14} className="text-blue-400" />;
    }
    return null;
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
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white max-w-md animate-slide-in`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Categories</h1>
          <p className="text-gray-400">Manage your book categories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchCategories();
              showNotification('success', 'Categories refreshed');
            }}
            className="bg-gray-700/50 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-600/50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <StatsCards 
        variant="compact"
        stats={[
          { 
            title: 'Total Categories', 
            value: stats.totalCategories, 
            icon: FolderTree,
            color: 'bg-blue-500',
            gradient: 'from-blue-600/20 to-blue-600/5',
            borderColor: 'border-blue-500/30',
            subtitle: `${stats.totalCategories} categories total`,
            progress: 100
          },
          { 
            title: 'Categories with Books', 
            value: stats.categoriesWithBooks, 
            icon: BookOpen,
            color: 'bg-emerald-500',
            gradient: 'from-emerald-600/20 to-emerald-600/5',
            borderColor: 'border-emerald-500/30',
            subtitle: `${stats.categoriesWithBooks} have books`,
            progress: Math.min((stats.categoriesWithBooks / Math.max(stats.totalCategories, 1)) * 100, 100)
          },
          { 
            title: 'Empty Categories', 
            value: stats.emptyCategories, 
            icon: FolderOpen,
            color: 'bg-yellow-500',
            gradient: 'from-yellow-600/20 to-yellow-600/5',
            borderColor: 'border-yellow-500/30',
            subtitle: `${stats.emptyCategories} need books`,
            progress: Math.min((stats.emptyCategories / Math.max(stats.totalCategories, 1)) * 100, 100)
          },
        ]}
        className="mb-8"
      />

      {/* Filters */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="min-w-[180px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="az">A to Z</option>
              <option value="za">Z to A</option>
              <option value="most_books">Most Books</option>
              <option value="least_books">Least Books</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setSortBy('az');
            }}
            className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {currentCategories.length === 0 ? (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-12 text-center">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-white text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-gray-400">
            {search ? 'Try adjusting your search or filter criteria' : 'Add your first category to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategories.map((category) => (
              <div 
                key={category.id} 
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-700/50 p-2.5 rounded-xl">
                      {category.book_count > 0 ? (
                        <FolderOpen className="text-blue-400" size={22} />
                      ) : (
                        <FolderOpen className="text-gray-500" size={22} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openViewModal(category)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/books?category=${encodeURIComponent(category.name)}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition"
                    >
                      <BookOpen size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-white">
                        {category.book_count}
                      </span>
                      <span className="text-xs text-gray-400">
                        {category.book_count === 1 ? 'book' : 'books'}
                      </span>
                    </Link>
                    
                    {category.book_count === 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/50">
                        Empty
                      </span>
                    )}
                  </div>
                  
                  {/* Date Display - Only show if date exists */}
                  {category.created_at && (
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(category.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredCategories.length > itemsPerPage && (
            <div className="mt-6 px-6 py-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 flex flex-wrap justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                Showing {startIndex + 1}–{endIndex} of {filteredCategories.length} categories
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === 1
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700/50 text-white hover:bg-gray-600/50'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3.5 py-1.5 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    currentPage === totalPages
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700/50 text-white hover:bg-gray-600/50'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== ADD/EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Name must be unique (case-insensitive)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter category description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW DETAILS MODAL ===== */}
      {isViewModalOpen && viewingCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Category Details</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingCategory(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-gray-700/50 p-3 rounded-xl">
                  {viewingCategory.book_count > 0 ? (
                    <FolderOpen className="text-blue-400" size={28} />
                  ) : (
                    <FolderOpen className="text-gray-500" size={28} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">{viewingCategory.name}</h3>
                  {viewingCategory.description && (
                    <p className="text-gray-300 mt-1">{viewingCategory.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                <div>
                  <p className="text-gray-500 text-sm">Total Books</p>
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-400" />
                    <span className="text-white text-lg font-semibold">
                      {viewingCategory.book_count}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {viewingCategory.book_count === 1 ? 'book' : 'books'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  {viewingCategory.book_count > 0 ? (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/50">
                      Empty
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Created</p>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Calendar size={14} className="text-gray-500" />
                    {viewingCategory.created_at ? (
                      new Date(viewingCategory.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Clock size={14} className="text-gray-500" />
                    {viewingCategory.last_updated || viewingCategory.created_at ? (
                      new Date(viewingCategory.last_updated || viewingCategory.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <Link
                  href={`/books?category=${encodeURIComponent(viewingCategory.name)}`}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 transition"
                >
                  <BookOpen size={14} />
                  View all books in this category →
                </Link>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const cat = viewingCategory;
                    setIsViewModalOpen(false);
                    setViewingCategory(null);
                    openEditModal(cat);
                  }}
                  className="flex-1 bg-yellow-600 text-white py-2.5 rounded-xl hover:bg-yellow-700 transition"
                >
                  Edit Category
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingCategory(null);
                  }}
                  className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
     

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {isDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${deletingCategory.book_count > 0 ? 'bg-yellow-900/50' : 'bg-red-900/50'}`}>
                {deletingCategory.book_count > 0 ? (
                  <AlertTriangle className="text-yellow-400" size={28} />
                ) : (
                  <AlertTriangle className="text-red-400" size={28} />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">Delete Category</h2>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete the category
            </p>
            <p className="text-white font-semibold text-lg mb-4">
              "{deletingCategory.name}"?
            </p>

            {deletingCategory.book_count > 0 ? (
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  ⚠️ Cannot delete this category
                </p>
                <p className="text-yellow-300/80 text-sm">
                  This category has <strong>{deletingCategory.book_count}</strong> book{deletingCategory.book_count > 1 ? 's' : ''} assigned to it.
                  Please reassign or remove these books before deleting this category.
                </p>
                <Link
                  href={`/books?category=${encodeURIComponent(deletingCategory.name)}`}
                  className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  View books in this category →
                </Link>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4">
                This action cannot be undone. The category will be permanently deleted.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading || deletingCategory.book_count > 0}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
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
                    {deletingCategory.book_count > 0 ? 'Cannot Delete' : 'Delete Category'}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCategory(null);
                }}
                className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DISCARD CHANGES MODAL ===== */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-900/50 p-3 rounded-full">
                <AlertTriangle className="text-yellow-400" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">Discard Changes?</h2>
            </div>

            <p className="text-gray-300 mb-2">
              You have unsaved changes.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to close this form? Your changes will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleContinueEditing}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                Continue Editing
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

 

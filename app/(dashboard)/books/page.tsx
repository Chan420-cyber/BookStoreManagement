'use client';

import StatsCards from '@/components/ui/stats-cards';
import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  ChevronLeft, ChevronRight, X, Save,
  Image as ImageIcon, Package, DollarSign,
  AlertTriangle, BookOpen, RefreshCw,
  Book as BookIcon
} from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category_id: number;
  category_name: string;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  description: string;
  publisher: string;
  edition: string;
  publication_year: number;
  date_added: string;
  last_updated: string;
  status: string;
  cover_image?: string;
}

interface Category {
  id: number;
  name: string;
}

type SortOption = 'newest' | 'oldest' | 'price_low' | 'price_high' | 'stock_high';
type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export default function BooksPage() {
  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Book states
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    price: '',
    stock_quantity: '',
    minimum_stock: '5',
    description: '',
    publisher: '',
    edition: '',
    publication_year: '',
    cover_image: ''
  });

  // ===== FORM HANDLING FUNCTIONS =====
  
  // Update form data and track changes
  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Check if form has changes
  const checkUnsavedChanges = () => {
    if (editingBook) {
      const hasChanges = 
        formData.title !== editingBook.title ||
        formData.author !== editingBook.author ||
        formData.isbn !== (editingBook.isbn || '') ||
        formData.category_id !== (editingBook.category_id?.toString() || '') ||
        formData.price !== editingBook.price.toString() ||
        formData.stock_quantity !== editingBook.stock_quantity.toString() ||
        formData.minimum_stock !== (editingBook.minimum_stock?.toString() || '5') ||
        formData.description !== (editingBook.description || '') ||
        formData.publisher !== (editingBook.publisher || '') ||
        formData.edition !== (editingBook.edition || '') ||
        formData.publication_year !== (editingBook.publication_year?.toString() || '') ||
        formData.cover_image !== (editingBook.cover_image || '');
      return hasChanges;
    } else {
      return (
        formData.title.trim() !== '' ||
        formData.author.trim() !== '' ||
        formData.isbn.trim() !== '' ||
        formData.category_id !== '' ||
        formData.price !== '' ||
        formData.stock_quantity !== '' ||
        formData.description.trim() !== '' ||
        formData.publisher.trim() !== '' ||
        formData.edition.trim() !== '' ||
        formData.publication_year !== '' ||
        formData.cover_image !== ''
      );
    }
  };

  // ===== MODAL OPEN/CLOSE FUNCTIONS =====
  
  // Open Add Modal
  const openAddModal = () => {
    setEditingBook(null);
    resetForm();
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category_id: book.category_id?.toString() || '',
      price: book.price.toString(),
      stock_quantity: book.stock_quantity.toString(),
      minimum_stock: book.minimum_stock?.toString() || '5',
      description: book.description || '',
      publisher: book.publisher || '',
      edition: book.edition || '',
      publication_year: book.publication_year?.toString() || '',
      cover_image: book.cover_image || ''
    });
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  // Handle Close Modal (checks for unsaved changes)
  const handleCloseModal = () => {
    if (hasUnsavedChanges && checkUnsavedChanges()) {
      setShowDiscardModal(true);
    } else {
      closeModal();
    }
  };

  // Close Modal (force close without checking)
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    resetForm();
    setHasUnsavedChanges(false);
  };

  // Handle Discard (discard changes and close)
  const handleDiscard = () => {
    setShowDiscardModal(false);
    closeModal();
  };

  // Handle Continue Editing (stay in form)
  const handleContinueEditing = () => {
    setShowDiscardModal(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category_id: '',
      price: '',
      stock_quantity: '',
      minimum_stock: '5',
      description: '',
      publisher: '',
      edition: '',
      publication_year: '',
      cover_image: ''
    });
  };

  // ===== SUMMARY STATS =====
  const stats = useMemo(() => {
    const totalBooks = filteredBooks.length;
    const totalStock = filteredBooks.reduce((sum, b) => sum + b.stock_quantity, 0);
    const inventoryValue = filteredBooks.reduce((sum, b) => sum + (b.price * b.stock_quantity), 0);
    const lowStock = filteredBooks.filter(b => b.stock_quantity >= 1 && b.stock_quantity <= 5).length;
    const outOfStock = filteredBooks.filter(b => b.stock_quantity === 0).length;
    return { totalBooks, totalStock, inventoryValue, lowStock, outOfStock };
  }, [filteredBooks]);

  // ===== FETCH DATA =====
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [books, search, categoryFilter, stockFilter, sortBy]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      showNotification('error', 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...books];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(book =>
        book.title?.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower) ||
        book.isbn?.toLowerCase().includes(searchLower) ||
        book.category_name?.toLowerCase().includes(searchLower)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(book => 
        book.category_name?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (stockFilter === 'in_stock') {
      result = result.filter(book => book.stock_quantity >= 6);
    } else if (stockFilter === 'low_stock') {
      result = result.filter(book => book.stock_quantity >= 1 && book.stock_quantity <= 5);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter(book => book.stock_quantity === 0);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.date_added).getTime() - new Date(b.date_added).getTime());
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock_high':
        result.sort((a, b) => b.stock_quantity - a.stock_quantity);
        break;
    }

    setFilteredBooks(result);
    setCurrentPage(1);
  };

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBooks.length);
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // ===== CRUD OPERATIONS =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showNotification('error', 'Title is required');
      return;
    }

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim() || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        minimum_stock: parseInt(formData.minimum_stock || '5'),
        description: formData.description.trim() || null,
        publisher: formData.publisher.trim() || null,
        edition: formData.edition.trim() || null,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save book';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      closeModal();
      await fetchBooks();
      showNotification('success', editingBook ? 'Book updated successfully' : 'Book added successfully');
      
    } catch (error: any) {
      console.error('❌ Save error:', error);
      showNotification('error', error.message || 'Error saving book');
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) {
      showNotification('error', 'No book selected for deletion');
      return;
    }

    const bookId = deletingBook.id;
    if (!bookId) {
      showNotification('error', 'Invalid book ID');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to delete book';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setIsDeleteModalOpen(false);
      setDeletingBook(null);
      showNotification('success', 'Book deleted successfully');
      await fetchBooks();
      
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      showNotification('error', error.message || 'Error deleting book');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (book: Book) => {
    setViewingBook(book);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (book: Book) => {
    setDeletingBook(book);
    setIsDeleteModalOpen(true);
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return 'bg-red-900/50 text-red-300 border border-red-500/30';
    if (stock <= 5) return 'bg-orange-900/50 text-orange-300 border border-orange-500/30';
    return 'bg-green-900/50 text-green-300 border border-green-500/30';
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusIcon = (stock: number) => {
    if (stock === 0) return <AlertTriangle size={14} className="text-red-400" />;
    if (stock <= 5) return <AlertTriangle size={14} className="text-orange-400" />;
    return <BookOpen size={14} className="text-green-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading books...</div>
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
          <h1 className="text-2xl font-bold text-white mb-2">Books</h1>
          <p className="text-gray-400">Manage your book collection</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchBooks();
              showNotification('success', 'Books refreshed');
            }}
            className="bg-gray-700/50 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-600/50 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={openAddModal}  // ← FIXED: Using openAddModal
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
          >
            <Plus size={20} /> Add Book
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <StatsCards 
        variant="compact"
        stats={[
          { 
            title: 'Total Books', 
            value: stats.totalBooks, 
            icon: BookIcon,
            color: 'bg-blue-500',
            gradient: 'from-blue-600/20 to-blue-600/5',
            borderColor: 'border-blue-500/30',
            subtitle: `${stats.totalBooks} books in collection`,
            progress: 100
          },
          { 
            title: 'Total Stock', 
            value: stats.totalStock, 
            icon: Package,
            color: 'bg-emerald-500',
            gradient: 'from-emerald-600/20 to-emerald-600/5',
            borderColor: 'border-emerald-500/30',
            subtitle: `${stats.totalStock} units available`,
            progress: 100
          },
          { 
            title: 'Inventory Value', 
            value: stats.inventoryValue, 
            icon: DollarSign,
            color: 'bg-purple-500',
            gradient: 'from-purple-600/20 to-purple-600/5',
            borderColor: 'border-purple-500/30',
            subtitle: `Total inventory worth`,
            progress: 100
          },
          { 
            title: 'Low Stock', 
            value: stats.lowStock, 
            icon: AlertTriangle,
            color: 'bg-orange-500',
            gradient: 'from-orange-600/20 to-orange-600/5',
            borderColor: 'border-orange-500/30',
            subtitle: `${stats.lowStock} books need reorder`,
            progress: Math.min((stats.lowStock / 10) * 100, 100)
          },
          { 
            title: 'Out of Stock', 
            value: stats.outOfStock, 
            icon: Package,
            color: 'bg-red-500',
            gradient: 'from-red-600/20 to-red-600/5',
            borderColor: 'border-red-500/30',
            subtitle: `${stats.outOfStock} books unavailable`,
            progress: Math.min((stats.outOfStock / 10) * 100, 100)
          },
        ]}
        className="mb-8"
      />

      {/* Filters */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, author, ISBN, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[130px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Stock</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="stock_high">Stock: High to Low</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('all');
              setStockFilter('all');
              setSortBy('newest');
            }}
            className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-700/90 border-b border-gray-600/50 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cover</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ISBN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {currentBooks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
                    No books found matching your criteria
                  </td>
                </tr>
              ) : (
                currentBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-700/30 transition-all duration-200 group">
                    <td className="px-4 py-3">
                      <div className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{book.title}</td>
                    <td className="px-4 py-3 text-gray-300">{book.isbn || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300">{book.author}</td>
                    <td className="px-4 py-3 text-gray-300">
                      <span className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs">
                        {book.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-medium">${Number(book.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-300">{book.stock_quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${getStatusColor(book.stock_quantity)}`}>
                        {getStatusIcon(book.stock_quantity)}
                        {getStatusText(book.stock_quantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {book.last_updated ? new Date(book.last_updated).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openViewModal(book)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(book)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBooks.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-700/50 flex flex-wrap justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              Showing {startIndex + 1}–{endIndex} of {filteredBooks.length} books
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
      </div>

      {/* ===== ADD/EDIT MODAL ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={handleCloseModal}  // ← FIXED: Using handleCloseModal
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => updateFormData('author', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => updateFormData('isbn', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="978-0-123-45678-9"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => updateFormData('category_id', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => updateFormData('stock_quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => updateFormData('publisher', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Publication Year</label>
                  <input
                    type="number"
                    value={formData.publication_year}
                    onChange={(e) => updateFormData('publication_year', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
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
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}  // ← FIXED: Using handleCloseModal
                  className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
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

      {/* View Details Modal */}
      {isViewModalOpen && viewingBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Book Details</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingBook(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="w-full aspect-[3/4] bg-gray-700 rounded-xl flex items-center justify-center">
                  {viewingBook.cover_image ? (
                    <img src={viewingBook.cover_image} alt={viewingBook.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <ImageIcon size={48} className="text-gray-500" />
                  )}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-2xl font-bold text-white">{viewingBook.title}</h3>
                <p className="text-gray-300 text-lg">by {viewingBook.author}</p>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm">ISBN</p>
                    <p className="text-white">{viewingBook.isbn || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Publisher</p>
                    <p className="text-white">{viewingBook.publisher || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Category</p>
                    <p className="text-white">{viewingBook.category_name || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Price</p>
                    <p className="text-white font-semibold">${Number(viewingBook.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Stock</p>
                    <p className="text-white">{viewingBook.stock_quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5 ${getStatusColor(viewingBook.stock_quantity)}`}>
                      {getStatusIcon(viewingBook.stock_quantity)}
                      {getStatusText(viewingBook.stock_quantity)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="text-gray-300 text-sm">{viewingBook.description || 'No description available'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date Added</p>
                    <p className="text-gray-400 text-sm">{new Date(viewingBook.date_added).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Last Updated</p>
                    <p className="text-gray-400 text-sm">{new Date(viewingBook.last_updated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6 mt-4 border-t border-gray-700/50">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingBook(null);
                }}
                className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const book = viewingBook;
                  setIsViewModalOpen(false);
                  setViewingBook(null);
                  openEditModal(book);
                }}
                className="flex-1 bg-yellow-600 text-white py-2.5 rounded-xl hover:bg-yellow-700 transition"
              >
                Edit Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/50 p-3 rounded-full">
                <AlertTriangle className="text-red-400" size={28} />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Book</h2>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete the book
            </p>
            <p className="text-white font-semibold text-lg mb-4">
              "{deletingBook.title}"?
            </p>

            <p className="text-gray-400 text-xs mb-4">
              Book ID: {deletingBook.id}
            </p>

            <p className="text-gray-400 text-sm mb-4">
              This action cannot be undone. The book will be soft-deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                  deleteLoading
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
                    Delete Book
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingBook(null);
                }}
                className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition"
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
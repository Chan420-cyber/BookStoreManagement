'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, 
  X, Save, Users, Mail, Phone, 
  AlertTriangle, RefreshCw, ChevronLeft,
  ChevronRight, Calendar, Clock, User,
  ShoppingBag, DollarSign, UserPlus,
  ArrowUp, ArrowDown, Filter, MoreVertical,
  Award, UserCheck, UserX, Zap
} from 'lucide-react';
import StatsCards from '@/components/ui/stats-cards';
import Link from 'next/link';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  total_orders: number;
  total_spent: number;
  last_purchase_date: string;
  created_at: string;
  status: 'active' | 'inactive';
  role?: string;
}

type SortOption = 'newest' | 'oldest' | 'name_az' | 'name_za' | 'most_orders' | 'most_spent' | 'recently_active';

export default function CustomersPage() {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [isCardClickable, setIsCardClickable] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Customer states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'staff'
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Summary stats
  const stats = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter(c => c.status === 'active').length;
    const inactiveCustomers = filteredCustomers.filter(c => c.status === 'inactive').length;
    const newCustomers = filteredCustomers.filter(c => c.total_orders === 0).length;
    const totalSpent = filteredCustomers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    return { totalCustomers, activeCustomers, inactiveCustomers, newCustomers, totalSpent, totalOrders };
  }, [filteredCustomers]);

  // Fetch data
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [customers, search, sortBy]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Customers data:', data);
      
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error('Expected array but got:', typeof data);
        setCustomers([]);
        showNotification('error', 'Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      showNotification('error', 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    if (!Array.isArray(customers)) {
      console.error('customers is not an array:', customers);
      setFilteredCustomers([]);
      return;
    }

    let result = [...customers];

    // Search filter - now includes customer ID
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(customer =>
        customer.id?.toString().includes(search) ||
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'recently_active':
        result.sort((a, b) => {
          if (!a.last_purchase_date) return 1;
          if (!b.last_purchase_date) return -1;
          return new Date(b.last_purchase_date).getTime() - new Date(a.last_purchase_date).getTime();
        });
        break;
      case 'name_az':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_za':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'most_orders':
        result.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
        break;
      case 'most_spent':
        result.sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
        break;
    }

    setFilteredCustomers(result);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCustomers.length);
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showNotification('error', 'Customer name is required');
      return;
    }

    if (!validateEmail(formData.email.trim())) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          password: formData.password || undefined,
          role: formData.role || 'staff'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      resetForm();
      setHasUnsavedChanges(false);
      await fetchCustomers();
      showNotification('success', editingCustomer ? 'Customer updated successfully' : 'Customer added successfully');
      
    } catch (error: any) {
      console.error('Error saving customer:', error);
      showNotification('error', error.message || 'Error saving customer');
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    // Check if customer has orders
    if (deletingCustomer.total_orders > 0) {
      showNotification('error', 
        `Cannot delete "${deletingCustomer.name}" because they have ${deletingCustomer.total_orders} order(s).`
      );
      setIsDeleteModalOpen(false);
      setDeletingCustomer(null);
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/customers/${deletingCustomer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      setIsDeleteModalOpen(false);
      setDeletingCustomer(null);
      await fetchCustomers();
      showNotification('success', 'Customer deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      showNotification('error', error.message || 'Error deleting customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Modal functions
  const openAddModal = () => {
    setEditingCustomer(null);
    resetForm();
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      password: '',
      role: customer.role || 'staff'
    });
    setHasUnsavedChanges(false);
    setIsModalOpen(true);
  };

  const openViewModal = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  // Handle card click - opens view modal
  const handleCardClick = (customer: Customer, e: React.MouseEvent) => {
    // Don't open if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('.action-button')) return;
    openViewModal(customer);
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
    setEditingCustomer(null);
    resetForm();
    setHasUnsavedChanges(false);
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    closeModal();
  };

  const handleContinueEditing = () => {
    setShowDiscardModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      role: 'staff'
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Never';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Never';
    }
  };

  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Never';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
      return formatDate(dateString);
    } catch {
      return 'Never';
    }
  };

  // Get initials with improved logic
  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    const firstInitial = words[0].charAt(0);
    const lastInitial = words[words.length - 1].charAt(0);
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Get status badge
  const getStatusBadge = (status: string, totalOrders: number) => {
    if (totalOrders === 0) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/30">
          <Zap size={12} className="text-blue-400" />
          New
        </span>
      );
    }
    
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      );
    }
    
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/50">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading customers...</div>
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
          <h1 className="text-2xl font-bold text-white mb-2">Customers</h1>
          <p className="text-gray-400">Manage your customer database</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchCustomers();
              showNotification('success', 'Customers refreshed');
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
            <UserPlus size={20} /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <StatsCards 
        variant="compact"
        stats={[
          { 
            title: 'Total Customers', 
            value: stats.totalCustomers, 
            icon: Users,
            color: 'bg-blue-500',
            gradient: 'from-blue-600/20 to-blue-600/5',
            borderColor: 'border-blue-500/30',
            subtitle: `${stats.totalCustomers} customers total`,
            progress: 100
          },
          { 
            title: 'Active Customers', 
            value: stats.activeCustomers, 
            icon: UserCheck,
            color: 'bg-emerald-500',
            gradient: 'from-emerald-600/20 to-emerald-600/5',
            borderColor: 'border-emerald-500/30',
            subtitle: `${stats.activeCustomers} active customers`,
            progress: Math.min((stats.activeCustomers / Math.max(stats.totalCustomers, 1)) * 100, 100)
          },
          { 
            title: 'New Customers', 
            value: stats.newCustomers, 
            icon: Award,
            color: 'bg-blue-500',
            gradient: 'from-blue-600/20 to-blue-600/5',
            borderColor: 'border-blue-500/30',
            subtitle: `${stats.newCustomers} new customers`,
            progress: Math.min((stats.newCustomers / Math.max(stats.totalCustomers, 1)) * 100, 100)
          },
          { 
            title: 'Total Revenue', 
            value: stats.totalSpent, 
            icon: DollarSign,
            color: 'bg-yellow-500',
            gradient: 'from-yellow-600/20 to-yellow-600/5',
            borderColor: 'border-yellow-500/30',
            subtitle: `$${stats.totalSpent.toFixed(2)} total`,
            progress: 100
          },
        ]}
        className="mb-8"
      />

      {/* Filters */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search - Updated to include Customer ID */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by ID, name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort - Default changed to Newest First */}
          <div className="min-w-[180px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="recently_active">Recently Active</option>
              <option value="oldest">Oldest First</option>
              <option value="name_az">Name: A to Z</option>
              <option value="name_za">Name: Z to A</option>
              <option value="most_orders">Most Orders</option>
              <option value="most_spent">Most Spent</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="min-w-[130px]">
            <label className="block text-gray-400 text-sm font-medium mb-1.5">Show</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="9">9 per page</option>
              <option value="12">12 per page</option>
              <option value="15">15 per page</option>
              <option value="24">24 per page</option>
              <option value="30">30 per page</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setSortBy('newest');
            }}
            className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Customers Grid */}
      {currentCustomers.length === 0 ? (
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-white text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-gray-400">
            {search ? 'Try adjusting your search criteria' : 'Add your first customer to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {currentCustomers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-5 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                onClick={(e) => handleCardClick(customer, e)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {getInitials(customer.name)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white text-base truncate">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">#{customer.id}</span>
                          {getStatusBadge(customer.status, customer.total_orders)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                      <Mail size={12} className="flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Stats - Compact Layout */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/50">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Orders</p>
                    <p className="text-white font-semibold text-sm">{customer.total_orders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Spent</p>
                    <p className="text-emerald-400 font-semibold text-sm">
                      ${(customer.total_spent || 0).toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider">Last Active</p>
                    <p className="text-gray-300 text-xs truncate" title={formatDate(customer.last_purchase_date)}>
                      {customer.total_orders > 0 ? formatRelativeTime(customer.last_purchase_date) : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - More compact */}
                <div className="flex justify-end gap-1 pt-3 border-t border-gray-700/50 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewModal(customer);
                    }}
                    className="action-button p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(customer);
                    }}
                    className="action-button p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(customer);
                    }}
                    className="action-button p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredCustomers.length > itemsPerPage && (
            <div className="mt-6 px-6 py-4 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 flex flex-wrap justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                Showing {startIndex + 1}–{endIndex} of {filteredCustomers.length} customers
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
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter address (optional)"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required={!editingCustomer}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
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
      {isViewModalOpen && viewingCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Customer Details</h2>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingCustomer(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                  {getInitials(viewingCustomer.name)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{viewingCustomer.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500">#{viewingCustomer.id}</span>
                    {getStatusBadge(viewingCustomer.status, viewingCustomer.total_orders)}
                    <span className="text-gray-400 text-xs">
                      Joined {formatDate(viewingCustomer.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Mail size={14} className="text-gray-500" />
                    {viewingCustomer.email}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    <Phone size={14} className="text-gray-500" />
                    {viewingCustomer.phone || 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Address</p>
                  <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                    {viewingCustomer.address || 'No address provided'}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-white font-semibold text-lg">
                    {viewingCustomer.total_orders || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Spent</p>
                  <p className="text-emerald-400 font-semibold text-lg">
                    ${(viewingCustomer.total_spent || 0).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Last Purchase</p>
                  <p className="text-gray-300">
                    {viewingCustomer.last_purchase_date ? (
                      <span title={formatDate(viewingCustomer.last_purchase_date)}>
                        {formatRelativeTime(viewingCustomer.last_purchase_date)}
                      </span>
                    ) : (
                      'Never'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => {
                    const customer = viewingCustomer;
                    setIsViewModalOpen(false);
                    setViewingCustomer(null);
                    openEditModal(customer);
                  }}
                  className="flex-1 bg-yellow-600 text-white py-2.5 rounded-xl hover:bg-yellow-700 transition"
                >
                  Edit Customer
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingCustomer(null);
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
      {isDeleteModalOpen && deletingCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${deletingCustomer.total_orders > 0 ? 'bg-yellow-900/50' : 'bg-red-900/50'}`}>
                {deletingCustomer.total_orders > 0 ? (
                  <AlertTriangle className="text-yellow-400" size={28} />
                ) : (
                  <AlertTriangle className="text-red-400" size={28} />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">Delete Customer</h2>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete the customer
            </p>
            <p className="text-white font-semibold text-lg mb-4">
              "{deletingCustomer.name}"?
            </p>

            {deletingCustomer.total_orders > 0 ? (
              <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  ⚠️ Cannot delete this customer
                </p>
                <p className="text-yellow-300/80 text-sm">
                  This customer has <strong>{deletingCustomer.total_orders}</strong> order{deletingCustomer.total_orders > 1 ? 's' : ''} associated with them.
                  Orders must be removed or reassigned before deleting this customer.
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mb-4">
                This action cannot be undone. The customer will be permanently deleted.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading || deletingCustomer.total_orders > 0}
                className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                  deleteLoading || deletingCustomer.total_orders > 0
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
                    {deletingCustomer.total_orders > 0 ? 'Cannot Delete' : 'Delete Customer'}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingCustomer(null);
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
}
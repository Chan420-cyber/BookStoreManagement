'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User, Shield, Bell, Palette, Globe,
  Save, Eye, EyeOff, Camera,
  LogOut, AlertTriangle, CheckCircle,
  X, RefreshCw, Mail, ShoppingBag,
  Package, Megaphone, Clock, Calendar,
  DollarSign, Languages,
  Moon, Sun, Monitor, LayoutGrid,
  List, Users, Loader2, Smartphone,
  Zap, TrendingDown, Lock, HelpCircle,
  Check, ChevronDown, Globe2, Type,
  Phone, MapPin, Award, UserPlus,
  Edit2, Trash2
} from 'lucide-react';

// ===== TYPES =====
interface FormData {
  // Profile
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string | null;

  // Security
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;

  // Notifications
  emailNotifications: boolean;
  orderUpdates: boolean;
  inventoryAlerts: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;

  // Appearance
  theme: 'dark' | 'light' | 'system';
  density: 'compact' | 'comfortable';
  fontSize: 'small' | 'medium' | 'large';
  accentColor: string;

  // General
  storeName: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  lowStockThreshold: number;
  storeAddress: string;
  storePhone: string;
}

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'general' | 'users';

export default function SettingsPage() {
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    weeklyReports: true,
    theme: 'dark',
    density: 'comfortable',
    fontSize: 'medium',
    accentColor: 'blue',
    storeName: 'BookStore',
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    language: 'en-US',
    lowStockThreshold: 10,
    storeAddress: '',
    storePhone: '',
  });

  const [originalData, setOriginalData] = useState<FormData>({ ...formData });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showDangerModal, setShowDangerModal] = useState<{ type: 'logout' | 'delete' | null }>({ type: null });
  const [isDangerLoading, setIsDangerLoading] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const hasChanges =
      formData.fullName !== originalData.fullName ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone ||
      formData.bio !== originalData.bio ||
      formData.storeName !== originalData.storeName ||
      formData.currency !== originalData.currency ||
      formData.timezone !== originalData.timezone ||
      formData.dateFormat !== originalData.dateFormat ||
      formData.language !== originalData.language ||
      formData.lowStockThreshold !== originalData.lowStockThreshold ||
      formData.theme !== originalData.theme ||
      formData.density !== originalData.density ||
      formData.fontSize !== originalData.fontSize ||
      formData.emailNotifications !== originalData.emailNotifications ||
      formData.orderUpdates !== originalData.orderUpdates ||
      formData.inventoryAlerts !== originalData.inventoryAlerts ||
      formData.marketingEmails !== originalData.marketingEmails ||
      formData.pushNotifications !== originalData.pushNotifications ||
      formData.weeklyReports !== originalData.weeklyReports ||
      formData.twoFactorEnabled !== originalData.twoFactorEnabled ||
      formData.storeAddress !== originalData.storeAddress ||
      formData.storePhone !== originalData.storePhone;

    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // ===== FETCH FUNCTIONS =====
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        }));
        setOriginalData(prev => ({
          ...prev,
          fullName: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // ===== HANDLERS =====
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const updateData = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
        store_name: formData.storeName.trim(),
        currency: formData.currency,
        timezone: formData.timezone,
        date_format: formData.dateFormat,
        language: formData.language,
        low_stock_threshold: formData.lowStockThreshold,
        theme: formData.theme,
        density: formData.density,
        font_size: formData.fontSize,
        accent_color: formData.accentColor,
        email_notifications: formData.emailNotifications,
        order_updates: formData.orderUpdates,
        inventory_alerts: formData.inventoryAlerts,
        marketing_emails: formData.marketingEmails,
        push_notifications: formData.pushNotifications,
        weekly_reports: formData.weeklyReports,
        two_factor_enabled: formData.twoFactorEnabled,
        store_address: formData.storeAddress,
        store_phone: formData.storePhone,
      };

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setOriginalData({ ...formData });
      setHasUnsavedChanges(false);
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData({ ...originalData });
    setHasUnsavedChanges(false);
  };

  const handleTabChange = (tab: Tab) => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
      return;
    }
    setActiveTab(tab);
    setValidationErrors({});
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-gray-500' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    const strengths = [
      { score: 0, label: 'Weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500' },
      { score: 3, label: 'Good', color: 'bg-green-500' },
      { score: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return strengths[score] || strengths[0];
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
    { id: 'general' as Tab, label: 'General', icon: Globe },
    { id: 'users' as Tab, label: 'Users', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white max-w-md animate-slide-in flex items-center gap-3`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-auto text-white hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and application preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
        <div className="border-b border-gray-700/50 px-6 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* ===== PROFILE TAB ===== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Profile Information</h2>
                <p className="text-gray-400 text-sm">Update your personal information</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(formData.fullName)
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg"
                  >
                    <Camera size={14} className="text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Upload Avatar</p>
                  <p className="text-gray-400 text-xs">PNG, JPG or WEBP (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tell us a little about yourself..." />
                </div>
              </div>
            </div>
          )}

          {/* ===== SECURITY TAB ===== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Security Settings</h2>
                <p className="text-gray-400 text-sm">Manage your password and security preferences</p>
              </div>

              <div className="bg-gray-700/30 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-white font-medium mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword.current ? 'text' : 'password'} value={formData.currentPassword} onChange={(e) => handleInputChange('currentPassword', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="Enter your current password" />
                      <button onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword.new ? 'text' : 'password'} value={formData.newPassword} onChange={(e) => handleInputChange('newPassword', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="Enter your new password (min 8 characters)" />
                      <button onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    {formData.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${getPasswordStrength(formData.newPassword).color} transition-all duration-300`} style={{ width: `${(getPasswordStrength(formData.newPassword).score / 4) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{getPasswordStrength(formData.newPassword).label}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Min 8 characters with uppercase, lowercase, number and special character</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword.confirm ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="Confirm your new password" />
                      <button onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">{showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                    <p className="text-gray-400 text-sm mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.twoFactorEnabled} onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-white font-medium mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center"><Smartphone size={16} className="text-blue-400" /></div>
                      <div><p className="text-white text-sm font-medium">Chrome on Windows</p><p className="text-gray-400 text-xs">Current session • Last active now</p></div>
                    </div>
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><Smartphone size={16} className="text-gray-400" /></div>
                      <div><p className="text-white text-sm font-medium">Safari on iPhone</p><p className="text-gray-400 text-xs">Last active 2 days ago</p></div>
                    </div>
                    <button className="text-red-400 hover:text-red-300 text-xs transition">Revoke</button>
                  </div>
                </div>
                <button onClick={() => setShowDangerModal({ type: 'logout' })} className="mt-4 text-red-400 hover:text-red-300 text-sm transition flex items-center gap-2">
                  <LogOut size={16} /> Logout from all devices
                </button>
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS TAB ===== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Notification Preferences</h2>
                <p className="text-gray-400 text-sm">Choose which notifications you want to receive</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'emailNotifications', label: 'Email Notifications', icon: Mail, desc: 'Receive email updates about your account' },
                  { id: 'orderUpdates', label: 'Order Updates', icon: ShoppingBag, desc: 'Get notified about new orders and status changes' },
                  { id: 'inventoryAlerts', label: 'Inventory Alerts', icon: Package, desc: 'Receive alerts when stock is running low' },
                  { id: 'pushNotifications', label: 'Push Notifications', icon: Bell, desc: 'Get push notifications in your browser' },
                  { id: 'weeklyReports', label: 'Weekly Reports', icon: Calendar, desc: 'Receive weekly summary reports via email' },
                  { id: 'marketingEmails', label: 'Marketing & Promotions', icon: Megaphone, desc: 'Get updates about new features and promotions' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700/50 rounded-lg"><item.icon size={18} className="text-gray-400" /></div>
                      <div><p className="text-white text-sm font-medium">{item.label}</p><p className="text-gray-400 text-xs">{item.desc}</p></div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData[item.id as keyof FormData] as boolean} onChange={(e) => handleInputChange(item.id as keyof FormData, e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== APPEARANCE TAB ===== */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Appearance</h2>
                <p className="text-gray-400 text-sm">Customize how the dashboard looks and feels</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((option) => (
                      <button key={option.value} onClick={() => handleInputChange('theme', option.value)} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition ${formData.theme === option.value ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700/50 bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'}`}>
                        <option.icon size={18} /> <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UI Density</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'compact', label: 'Compact', icon: LayoutGrid },
                      { value: 'comfortable', label: 'Comfortable', icon: List },
                    ].map((option) => (
                      <button key={option.value} onClick={() => handleInputChange('density', option.value)} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition ${formData.density === option.value ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700/50 bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'}`}>
                        <option.icon size={18} /> <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                    ].map((option) => (
                      <button key={option.value} onClick={() => handleInputChange('fontSize', option.value)} className={`flex items-center justify-center px-4 py-3 rounded-xl border transition ${formData.fontSize === option.value ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700/50 bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'}`}>
                        <span className={`text-sm font-medium ${option.value === 'small' ? 'text-xs' : option.value === 'large' ? 'text-base' : ''}`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== GENERAL TAB ===== */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">General Settings</h2>
                <p className="text-gray-400 text-sm">Configure your store settings and preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Store Name</label>
                  <input type="text" value={formData.storeName} onChange={(e) => handleInputChange('storeName', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Store Phone</label>
                  <input type="tel" value={formData.storePhone} onChange={(e) => handleInputChange('storePhone', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Store Address</label>
                  <textarea value={formData.storeAddress} onChange={(e) => handleInputChange('storeAddress', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Currency</label>
                  <select value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD (C$)</option><option value="AUD">AUD (A$)</option><option value="JPY">JPY (¥)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Time Zone</label>
                  <select value={formData.timezone} onChange={(e) => handleInputChange('timezone', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="America/New_York">Eastern Time (ET)</option><option value="America/Chicago">Central Time (CT)</option><option value="America/Denver">Mountain Time (MT)</option><option value="America/Los_Angeles">Pacific Time (PT)</option><option value="Europe/London">London (GMT)</option><option value="Europe/Paris">Paris (CET)</option><option value="Asia/Dubai">Dubai (GST)</option><option value="Asia/Tokyo">Tokyo (JST)</option><option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Date Format</label>
                  <select value={formData.dateFormat} onChange={(e) => handleInputChange('dateFormat', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option><option value="MMM DD, YYYY">MMM DD, YYYY</option><option value="DD MMM YYYY">DD MMM YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
                  <select value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="en-US">English (US)</option><option value="en-GB">English (UK)</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="ja">Japanese</option><option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Low Stock Threshold</label>
                  <input type="number" value={formData.lowStockThreshold} onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <p className="text-gray-500 text-xs mt-1">Books below this quantity will be marked as low stock</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS TAB ===== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">User Management</h2>
                <p className="text-gray-400 text-sm">Create and manage staff accounts</p>
              </div>

              <div className="bg-gray-700/30 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-white font-medium mb-4">Create New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" id="newUserName" placeholder="John Doe" className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                    <input type="email" id="newUserEmail" placeholder="john@bookstore.com" className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                    <input type="password" id="newUserPassword" placeholder="Min 8 characters" className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                    <select id="newUserRole" className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                    <input type="tel" id="newUserPhone" placeholder="+1 234 567 8900" className="w-full px-4 py-2.5 bg-gray-700/50 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const name = (document.getElementById('newUserName') as HTMLInputElement)?.value;
                    const email = (document.getElementById('newUserEmail') as HTMLInputElement)?.value;
                    const password = (document.getElementById('newUserPassword') as HTMLInputElement)?.value;
                    const role = (document.getElementById('newUserRole') as HTMLSelectElement)?.value;
                    const phone = (document.getElementById('newUserPhone') as HTMLInputElement)?.value;
                    if (!name || !email || !password) { alert('Please fill in all required fields'); return; }
                    try {
                      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role, phone }) });
                      const data = await response.json();
                      if (response.ok) { alert('User created successfully!'); document.getElementById('newUserName').value = ''; document.getElementById('newUserEmail').value = ''; document.getElementById('newUserPassword').value = ''; document.getElementById('newUserPhone').value = ''; fetchUsers(); }
                      else { alert(data.error || 'Failed to create user'); }
                    } catch (error) { alert('Error creating user'); }
                  }}
                  className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <UserPlus size={18} /> Create User
                </button>
              </div>

              <div className="bg-gray-700/30 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-white font-medium mb-4">Existing Users</h3>
                {usersLoading ? (
                  <div className="text-center py-4"><p className="text-gray-400">Loading users...</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50 border-b border-gray-600/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700/30 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-semibold">{(user.full_name || user.username || 'U').charAt(0).toUpperCase()}</span></div>
                                <span className="text-gray-300 text-sm">{user.full_name || user.username}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300 text-sm">{user.email}</td>
                            <td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-blue-900/50 text-blue-300 border border-blue-500/30'}`}>{user.role || 'staff'}</span></td>
                            <td className="px-4 py-3"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-900/50 text-green-300 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button className="text-blue-400 hover:text-blue-300 transition"><Edit2 size={16} /></button>
                                <button className="text-red-400 hover:text-red-300 transition"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700/50 bg-gray-800/30">
          {hasUnsavedChanges && (
            <button onClick={handleDiscard} className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition">
              Discard Changes
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className={`px-6 py-2.5 rounded-xl transition flex items-center gap-2 ${
              hasUnsavedChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 cursor-pointer'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* ===== DANGER ZONE ===== */}
      <div className="mt-8 bg-red-900/10 border border-red-800/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-900/30 rounded-xl"><AlertTriangle size={24} className="text-red-400" /></div>
          <div className="flex-1">
            <h3 className="text-red-400 font-semibold text-lg">Danger Zone</h3>
            <p className="text-gray-400 text-sm">Irreversible actions that affect your account</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={() => setShowDangerModal({ type: 'logout' })} className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition flex items-center gap-2">
                <LogOut size={16} /> Logout from all devices
              </button>
              <button onClick={() => setShowDangerModal({ type: 'delete' })} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition flex items-center gap-2 border border-red-800/30">
                <AlertTriangle size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DISCARD CHANGES MODAL ===== */}
      {showDiscardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-900/50 p-3 rounded-full"><AlertTriangle className="text-yellow-400" size={28} /></div>
              <h2 className="text-xl font-bold text-white">Discard Changes?</h2>
            </div>
            <p className="text-gray-300 mb-2">You have unsaved changes.</p>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to leave? Your changes will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDiscardModal(false)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition">Continue Editing</button>
              <button onClick={handleDiscard} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition">Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DANGER CONFIRMATION MODAL ===== */}
      {showDangerModal.type && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/50 p-3 rounded-full">
                {showDangerModal.type === 'logout' ? <LogOut className="text-red-400" size={28} /> : <AlertTriangle className="text-red-400" size={28} />}
              </div>
              <h2 className="text-xl font-bold text-white">{showDangerModal.type === 'logout' ? 'Logout from All Devices' : 'Delete Account'}</h2>
            </div>
            <p className="text-gray-300 mb-2">{showDangerModal.type === 'logout' ? 'You will be logged out from all devices and sessions.' : 'This action is irreversible. All your data will be permanently deleted.'}</p>
            <p className="text-red-400 text-sm mb-6">{showDangerModal.type === 'logout' ? 'You will need to log in again on all devices.' : 'Please confirm by typing your email address to proceed.'}</p>
            <div className="flex gap-3">
              <button onClick={() => handleDangerAction(showDangerModal.type!)} disabled={isDangerLoading} className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${isDangerLoading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : showDangerModal.type === 'logout' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {isDangerLoading ? <><RefreshCw size={18} className="animate-spin" /> Processing...</> : <>{showDangerModal.type === 'logout' ? 'Logout' : 'Delete Account'}</>}
              </button>
              <button onClick={() => setShowDangerModal({ type: null })} className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-xl hover:bg-gray-600/50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
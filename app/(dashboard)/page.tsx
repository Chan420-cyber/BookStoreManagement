'use client';

import { useEffect, useState } from 'react';
import { 
  Book, FolderOpen, AlertTriangle, Users, Plus, 
  ShoppingCart, DollarSign, Package, TrendingUp, 
  TrendingDown, ArrowUp, ArrowDown, Clock, 
  Calendar, Activity, BarChart3, Award, 
  Star, ChevronRight 
} from 'lucide-react';
import StatsCards from '@/components/ui/stats-cards';

interface DashboardStats {
  totalBooks: number;
  totalCategories: number;
  lowStockBooks: number;
  outOfStockBooks: number;
  activeCustomers: number;
  totalOrders: number;
  todaySales: number;
  monthlyRevenue: number;
  recentBooks: any[];
  recentOrders: any[];
  recentActivities: any[];
  bestSellers: any[];
  salesData: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalCategories: 0,
    lowStockBooks: 0,
    outOfStockBooks: 0,
    activeCustomers: 0,
    totalOrders: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    recentBooks: [],
    recentOrders: [],
    recentActivities: [],
    bestSellers: [],
    salesData: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  useEffect(() => {
    fetchDashboardData();
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format Stats for StatsCards component
  const statCards = [
    { 
      title: 'Total Books', 
      value: stats.totalBooks, 
      change: '+12.5%',
      icon: Book,
      color: 'bg-blue-600',
      gradient: 'from-blue-600/20 to-blue-600/5',
      borderColor: 'border-blue-500/30',
      subtitle: `${stats.totalBooks} books`,
      progress: Math.min((stats.totalBooks / 3000) * 100, 100)
    },
    { 
      title: 'Total Categories', 
      value: stats.totalCategories, 
      change: '+2',
      icon: FolderOpen,
      color: 'bg-green-600',
      gradient: 'from-green-600/20 to-green-600/5',
      borderColor: 'border-green-500/30',
      subtitle: `${stats.totalCategories} categories`,
      progress: Math.min((stats.totalCategories / 30) * 100, 100)
    },
    { 
      title: 'Low Stock', 
      value: stats.lowStockBooks, 
      change: '-8.2%',
      icon: AlertTriangle,
      color: 'bg-yellow-600',
      gradient: 'from-yellow-600/20 to-yellow-600/5',
      borderColor: 'border-yellow-500/30',
      subtitle: `${stats.lowStockBooks} need reorder`,
      progress: Math.min((stats.lowStockBooks / 100) * 100, 100)
    },
    { 
      title: 'Out of Stock', 
      value: stats.outOfStockBooks, 
      change: '-5.1%',
      icon: Package,
      color: 'bg-red-600',
      gradient: 'from-red-600/20 to-red-600/5',
      borderColor: 'border-red-500/30',
      subtitle: `${stats.outOfStockBooks} unavailable`,
      progress: Math.min((stats.outOfStockBooks / 50) * 100, 100)
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      change: '+22.3%',
      icon: ShoppingCart,
      color: 'bg-purple-600',
      gradient: 'from-purple-600/20 to-purple-600/5',
      borderColor: 'border-purple-500/30',
      subtitle: `${stats.totalOrders} orders`,
      progress: Math.min((stats.totalOrders / 100) * 100, 100)
    },
    { 
      title: "Today's Sales", 
      value: stats.todaySales, 
      change: '+15.7%',
      icon: DollarSign,
      color: 'bg-emerald-600',
      gradient: 'from-emerald-600/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      subtitle: `$${stats.todaySales.toFixed(2)} today`,
      suffix: '',
      progress: Math.min((stats.todaySales / 1000) * 100, 100)
    },
    { 
      title: 'Monthly Revenue', 
      value: stats.monthlyRevenue, 
      change: '+28.4%',
      icon: TrendingUp,
      color: 'bg-indigo-600',
      gradient: 'from-indigo-600/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30',
      subtitle: `$${stats.monthlyRevenue.toFixed(2)}`,
      suffix: '',
      progress: Math.min((stats.monthlyRevenue / 20000) * 100, 100)
    },
    { 
      title: 'Active Customers', 
      value: stats.activeCustomers, 
      change: '+18.3%',
      icon: Users,
      color: 'bg-pink-600',
      gradient: 'from-pink-600/20 to-pink-600/5',
      borderColor: 'border-pink-500/30',
      subtitle: `${stats.activeCustomers} customers`,
      progress: Math.min((stats.activeCustomers / 5000) * 100, 100)
    }
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Add Book', icon: Book, color: 'bg-blue-600', href: '/books' },
    { label: 'Add Category', icon: FolderOpen, color: 'bg-green-600', href: '/categories' },
    { label: 'Add Customer', icon: Users, color: 'bg-purple-600', href: '/customers' },
    { label: 'Create Order', icon: ShoppingCart, color: 'bg-orange-600', href: '/orders' },
  ];

  // Sales Data by period
  const salesData = {
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [420, 580, 350, 720, 890, 650, 480]
    },
    monthly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [2450, 3200, 2800, 4100]
    },
    yearly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [8500, 9200, 7800, 10500, 12000, 9800, 11500, 13200, 10800, 14500, 16000, 18500]
    }
  };

  const currentSalesData = salesData[selectedPeriod as keyof typeof salesData];
  const maxValue = Math.max(...currentSalesData.values) * 1.2;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Dashboard Header - Compact */}
      <div className="mb-3">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-white">👋 Bookstore Overview</h1>
            <p className="text-gray-400 text-sm">Track inventory, orders, sales, and customers.</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Clock size={14} />
            <span>Updated: {currentTime}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-3">
        <StatsCards stats={statCards} variant="dashboard" />
      </div>

      {/* Sales Chart + Best Sellers Row - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" />
                Sales Overview
              </h2>
            </div>
            <div className="flex gap-1">
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1, 3)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Bars - Reduced height */}
          <div className="h-32 flex items-end justify-between gap-1.5">
            {currentSalesData.values.map((value, index) => {
              const heightPercentage = (value / maxValue) * 100;
              const colors = [
                'from-emerald-500 to-green-500',
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-orange-500 to-red-500',
                'from-teal-500 to-emerald-500',
                'from-indigo-500 to-blue-500',
                'from-rose-500 to-pink-500'
              ];
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div 
                      className={`w-full bg-gradient-to-t ${colors[index % colors.length]} rounded-t transition-all duration-700 hover:scale-y-110 cursor-pointer`}
                      style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${value.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-[10px]">{currentSalesData.labels[index]}</span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-2 pt-2 border-t border-gray-700/50">
            <div className="text-gray-400 text-xs">
              Total: <span className="text-white font-semibold">
                ${currentSalesData.values.reduce((a, b) => a + b, 0).toFixed(0)}
              </span>
            </div>
            <div className="text-emerald-400 text-xs flex items-center gap-1">
              <TrendingUp size={12} />
              +23.5%
            </div>
          </div>
        </div>

        {/* Best Sellers Widget */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award size={16} className="text-yellow-400" />
              Best Sellers
            </h2>
            <button className="text-gray-400 hover:text-white transition">
              <ChevronRight size={16} />
            </button>
          </div>
          
          {stats.bestSellers && stats.bestSellers.length > 0 ? (
            <div className="space-y-2">
              {stats.bestSellers.slice(0, 4).map((book, index) => (
                <div key={index} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-700/30 transition">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center font-bold text-xs text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{book.title}</p>
                    <p className="text-gray-400 text-[10px] truncate">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-xs font-semibold">{book.sales}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Book size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-xs">No sales data</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Recent Activity - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Quick Actions */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`${action.color} text-white p-3 rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col items-center gap-1`}
              >
                <action.icon size={18} />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-purple-400" />
            Recent Activity
          </h2>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-700/30 transition border border-gray-700/20">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'order' ? 'bg-purple-900/50 text-purple-400' :
                    activity.type === 'book' ? 'bg-blue-900/50 text-blue-400' :
                    activity.type === 'customer' ? 'bg-green-900/50 text-green-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {activity.type === 'order' ? <ShoppingCart size={12} /> :
                     activity.type === 'book' ? <Book size={12} /> :
                     activity.type === 'customer' ? <Users size={12} /> :
                     <Activity size={12} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs">{activity.message}</p>
                    <p className="text-gray-500 text-[10px]">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-xs text-center py-2">No recent activity</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders - Compact with max height */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
        <div className="p-3 border-b border-gray-700/50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShoppingCart size={16} className="text-purple-400" />
            Recent Orders
          </h2>
          <button className="text-blue-400 hover:text-blue-300 text-xs transition">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto max-h-[150px] overflow-y-auto">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-700/50 border-b border-gray-600/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-300 uppercase">Order</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-300 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-300 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-300 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {stats.recentOrders.slice(0, 5).map((order, index) => (
                  <tr key={index} className="hover:bg-gray-700/30 transition">
                    <td className="px-4 py-2 text-white font-mono text-xs">#{order.id}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{order.customer}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">${Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        order.status === 'Completed' ? 'bg-green-900/50 text-green-300 border border-green-500/30' :
                        order.status === 'Processing' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' :
                        'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-[10px]">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">No recent orders</div>
          )}
        </div>
      </div>
    </div>
  );
}
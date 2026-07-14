'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderTree, 
  Package, 
  Users, 
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    // { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside 
        className={`bg-gray-800 shadow-xl flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Area */}
        <div className={`p-6 border-b border-gray-700 flex ${isSidebarOpen ? 'justify-between' : 'justify-center'} items-center`}>
          {isSidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold text-white">BookStore</h1>
              <p className="text-sm text-gray-400">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white transition"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Search Bar */}
        {/* <div className={`p-4 border-b border-gray-700 ${!isSidebarOpen && 'px-2'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${!isSidebarOpen && 'hidden'}`} size={18} />
            <input
              type="text"
              placeholder={isSidebarOpen ? "Search books, authors.." : ""}
              className={`bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSidebarOpen ? 'w-full pl-9 pr-3 py-2' : 'w-full px-2 py-2'
              }`}
            />
          </div>
        </div> */}

        {/* User Info */}
        <div className={`p-4 border-b border-gray-700 flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">AB</span>
          </div>
          {isSidebarOpen && (
            <div>
              <p className="font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@bookstore.com</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } ${!isSidebarOpen && 'justify-center'}`}
                    title={!isSidebarOpen ? item.name : ''}
                  >
                    <item.icon size={20} />
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button 
            className={`flex items-center gap-3 px-4 py-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition ${
              !isSidebarOpen && 'justify-center'
            }`}
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content - no need for bg-gray-900 here because root layout handles it */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
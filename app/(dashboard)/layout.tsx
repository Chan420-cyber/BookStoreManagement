'use client';

import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderTree, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Fetch user data
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser({
            name: data.full_name || data.username || 'Admin User',
            email: data.email || 'admin@bookstore.com'
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Categories', href: '/categories', icon: FolderTree },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Get user initials
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

        {/* User Info */}
        <div className={`p-4 border-b border-gray-700 flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
          {isSidebarOpen && user && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
            onClick={handleLogout}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-900">
        {children}
      </main>
    </div>
  );
}
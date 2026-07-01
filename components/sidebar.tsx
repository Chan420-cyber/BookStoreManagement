'use client'

import Link from 'next/link'
import { Book, LayoutDashboard, BookOpen, Tag, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
    { icon: Book, label: 'Books', href: '#' },
    { icon: BookOpen, label: 'Categories', href: '#' },
    { icon: Tag, label: 'Inventory', href: '#' },
    { icon: Users, label: 'Customers', href: '#' },
  ]

  return (
    <aside
      className={`relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-sidebar-border px-6 py-8 ${isCollapsed ? 'justify-center px-3' : ''}`}>
        <div className="flex items-center justify-center rounded-lg bg-sidebar-primary p-2">
          <Book size={24} className="text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">BookStore</h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                isCollapsed ? 'justify-center px-3' : ''
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-sidebar-border px-4 py-6">
        <Link
          href="#"
          className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isCollapsed ? 'justify-center px-3' : ''
          }`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </Link>
        <button className="w-full text-left" title={isCollapsed ? 'Logout' : ''}>
          <div className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isCollapsed ? 'justify-center px-3' : ''
          }`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </div>
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-sidebar-border bg-sidebar p-1.5 text-sidebar-foreground transition-all hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  )
}

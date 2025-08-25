'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  subItems?: {
    id: string;
    label: string;
    href: string;
  }[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalUsers: 0,
    activeEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (!sessionToken) return;

      const response = await fetch('/api/admin/sidebar-stats', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching sidebar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandedItem = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5zM8 15h8" />
        </svg>
      ),
    },
    {
      id: 'requests',
      label: 'Manage Requests',
      href: '/admin/requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11l2 2 4-4" />
        </svg>
      ),
      badge: loading ? undefined : stats.pendingRequests,
      subItems: [
        { id: 'all-requests', label: 'All Requests', href: '/admin/requests' },
        { id: 'pending-requests', label: 'Pending', href: '/admin/requests?status=pending' },
        { id: 'in-progress-requests', label: 'In Progress', href: '/admin/requests?status=in-progress' },
        { id: 'completed-requests', label: 'Completed', href: '/admin/requests?status=completed' },
        { id: 'cancelled-requests', label: 'Cancelled', href: '/admin/requests?status=cancelled' },
      ],
    },
    {
      id: 'users',
      label: 'Manage Users',
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      badge: loading ? undefined : stats.totalUsers,
    },
    {
      id: 'employees',
      label: 'Manage Employees',
      href: '/admin/employees',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ),
      badge: loading ? undefined : stats.activeEmployees,
    },
    {
      id: 'revenue',
      label: 'Manage Revenue',
      href: '/admin/revenue',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    
    // Handle query parameters for subitems
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      const urlParams = new URLSearchParams(query);
      const currentParams = searchParams;
      
      // Check if path matches and all query parameters match
      if (pathname === path) {
        for (const [key, value] of urlParams.entries()) {
          if (currentParams.get(key) !== value) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
    
    // For "All Requests" - only active when no query parameters
    if (href === '/admin/requests') {
      return pathname === href && !searchParams.get('status');
    }
    
    return pathname.startsWith(href);
  };

  const isParentActive = (item: SidebarItem) => {
    if (isActiveRoute(item.href)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActiveRoute(subItem.href));
    }
    return false;
  };

  // Auto-expand active parent items
  useEffect(() => {
    sidebarItems.forEach(item => {
      if (isParentActive(item) && item.subItems && !expandedItems.includes(item.id)) {
        setExpandedItems(prev => [...prev, item.id]);
      }
    });
  }, [pathname, searchParams]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <div key={item.id} className="space-y-1">
                {/* Main Item */}
                <div
                  className={`group flex items-center justify-between rounded-lg transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Link
                    href={item.href}
                    className="flex items-center flex-1 px-3 py-2.5 text-sm font-medium rounded-lg"
                    onClick={() => {
                      if (item.subItems) {
                        toggleExpandedItem(item.id);
                      }
                    }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 truncate">{item.label}</span>
                  </Link>

                  {/* Expand/Collapse Button for items with subitems */}
                  {item.subItems && (
                    <button
                      onClick={() => toggleExpandedItem(item.id)}
                      className="p-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedItems.includes(item.id) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Sub Items */}
                {item.subItems && expandedItems.includes(item.id) && (
                  <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-4">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isActiveRoute(subItem.href)
                            ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">Need Help?</p>
                  <p className="text-xs text-blue-700">Contact support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
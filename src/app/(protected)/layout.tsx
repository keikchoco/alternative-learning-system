'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  LayoutDashboard,
  Users,
  Map,
  LineChart,
  Settings,
  UserCog,
  LogOut,
  ChevronDown
} from 'lucide-react';

// Navigation items for all users
const commonNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Student Master List', href: '/students', icon: Users },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Student Progress', href: '/progress', icon: LineChart },
];

// Navigation items only for master admin
const masterAdminNavItems = [
  { name: 'Admin Management', href: '/admin', icon: UserCog },
  { name: 'System Settings', href: '/settings', icon: Settings },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get auth store state and actions
  const user = useAuthStore(state => state.auth.user);
  const logout = useAuthStore(state => state.logout);
  const initialize = useAuthStore(state => state.initialize);

  // Determine navigation items based on user role
  const navItems = user?.role === 'master_admin'
    ? [...commonNavItems, ...masterAdminNavItems]
    : commonNavItems;

  // Initialize auth state
  useEffect(() => {
    try {
      initialize();
    } catch (error) {
      console.error('Error initializing auth in layout:', error);
    }
  }, [initialize]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div
          className={`bg-blue-900 text-white ${
            isSidebarOpen ? 'w-64' : 'w-20'
          } transition-all duration-300 ease-in-out flex flex-col`}
        >
          {/* Sidebar header with white background and rounded bottom */}
          <div className="bg-white text-blue-900 p-4 rounded-b-2xl mb-4 shadow-md">
            <div className="flex items-center justify-between">
              {isSidebarOpen ? (
                <div className="flex items-center space-x-2">
                  <div className="relative h-10 w-10">
                    <Image
                      src="/images/als_logo.png"
                      alt="ALS Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-sm">ALTERNATIVE</span>
                    <span className="font-bold text-sm block -mt-1">LEARNING SYSTEM</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto">
                  <div className="relative h-10 w-10">
                    <Image
                      src="/images/als_logo.png"
                      alt="ALS Logo"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-blue-900 hover:text-blue-700"
              >
                {isSidebarOpen ? '◀' : '▶'}
              </button>
            </div>
          </div>

          {/* User profile */}
          <div className="px-4 pb-4 mb-2">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white rounded-full p-2 text-blue-900">
                <span className="text-xl">👤</span>
              </div>

              {isSidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || 'Staff Name'}</p>
                  <p className="text-xs text-blue-200">
                    {user?.role === 'master_admin' ? 'Master Admin' : 'Regular Admin'}
                    {user?.role === 'admin' && user?.assignedBarangayId && (
                      <span className="ml-1">({user.assignedBarangayId})</span>
                    )}
                  </p>
                  <div className="flex items-center text-xs text-blue-300 hover:text-white cursor-pointer">
                    <span>More info</span>
                    <ChevronDown size={12} className="ml-1" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* General divider */}
          <div className="px-4 mb-2">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-blue-300">GENERAL</span>
              <div className="flex-grow ml-2 h-px bg-white/30"></div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-lg ${
                      pathname === item.href
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-800'
                    } transition-colors duration-200`}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors duration-200"
            >
              <LogOut size={18} />
              {isSidebarOpen && <span className="ml-2">LOG OUT</span>}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-lg font-bold text-gray-800 uppercase">
                {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h1>

              <div className="flex items-center">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-gray-800">Hello!, {user?.name || 'Staff Name'}</span>
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    <span className="text-xs">👤</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

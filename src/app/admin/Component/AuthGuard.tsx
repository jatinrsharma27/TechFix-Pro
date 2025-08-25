'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for auth pages
      if (pathname?.startsWith('/admin/Auth') || pathname === '/admin/login') {
        setIsAuthenticated(true);
        return;
      }

      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');

      if (!adminData || !sessionToken) {
        setIsAuthenticated(false);
        router.push('/admin/Auth/Signin');
        return;
      }

      try {
        const admin = JSON.parse(adminData);
        if (admin && admin.id && admin.email) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/Auth/Signin');
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        setIsAuthenticated(false);
        router.push('/admin/Auth/Signin');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children if authenticated or on auth pages
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
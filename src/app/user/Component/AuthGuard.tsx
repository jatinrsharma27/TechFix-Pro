'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for public pages and auth pages
      const publicPages = ['/', '/user', '/user/About', '/user/Blog', '/user/Service'];
      const isPublicPage = publicPages.includes(pathname) ||
                           pathname?.startsWith('/user/About/') ||
                           pathname?.startsWith('/user/Blog/') ||
                           pathname?.startsWith('/user/Service/');
      
      // Skip auth check for auth pages
      const isAuthPage = pathname?.startsWith('/user/Auth') || pathname === '/user/login';
      
      if (isPublicPage || isAuthPage) {
        setIsAuthenticated(true);
        return;
      }

      try {
        // Check for authentication cookie first
        const authCookie = Cookies.get('auth');
        if (authCookie === 'true') {
          setIsAuthenticated(true);
          return;
        }

        // Check for Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Set authentication cookie
          Cookies.set('auth', 'true', { expires: 7 });
          setIsAuthenticated(true);
        } else {
          // Check for localStorage user data
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              JSON.parse(userData);
              // Set authentication cookie
              Cookies.set('auth', 'true', { expires: 7 });
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Error parsing localStorage user data:', error);
              // Remove authentication cookie
              Cookies.remove('auth');
              setIsAuthenticated(false);
              router.push('/user/Auth/Signin');
            }
          } else {
            // Remove authentication cookie
            Cookies.remove('auth');
            setIsAuthenticated(false);
            router.push('/user/Auth/Signin');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Remove authentication cookie
        Cookies.remove('auth');
        setIsAuthenticated(false);
        router.push('/user/Auth/Signin');
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
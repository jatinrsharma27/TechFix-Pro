'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPanel from '@/components/NotificationPanel';

export default function AdminNotificationsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const sessionToken = localStorage.getItem('admin_session_token');
    
    if (!adminData || !sessionToken) {
      router.push('/admin/Auth/Signin');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      router.push('/admin/Auth/Signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Manage your notifications and stay updated with system events</p>
      </div>
      
      <NotificationPanel userType="admin" userId={admin.id} />
    </div>
  );
}
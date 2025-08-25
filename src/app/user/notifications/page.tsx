'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPanel from '@/components/NotificationPanel';

export default function UserNotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const sessionToken = localStorage.getItem('user_session_token');
    
    if (!userData || !sessionToken) {
      router.push('/user/Auth/Signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/user/Auth/Signin');
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

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your service requests and important updates</p>
      </div>
      
      <NotificationPanel userType="user" userId={user.id} />
    </div>
  );
}
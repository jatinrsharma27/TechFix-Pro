'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationPanel from '@/components/NotificationPanel';

export default function EmployeeNotificationsPage() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const employeeData = localStorage.getItem('employee');
    const sessionToken = localStorage.getItem('employee_session_token');
    
    if (!employeeData || !sessionToken) {
      router.push('/employee/Auth/Signin');
      return;
    }

    try {
      const parsedEmployee = JSON.parse(employeeData);
      setEmployee(parsedEmployee);
    } catch (error) {
      console.error('Error parsing employee data:', error);
      router.push('/employee/Auth/Signin');
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

  if (!employee) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your assigned requests and system updates</p>
      </div>
      
      <NotificationPanel userType="employee" userId={employee.id} />
    </div>
  );
}
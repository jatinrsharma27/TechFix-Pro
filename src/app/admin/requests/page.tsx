'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

interface Request {
  id: string;
  full_name: string;  
  service: string;    
  brand_name: string;
  model_name: string;
  status: string;
  created_at: string;
  contact_no: string;
  assigned_to?: string;
  assigned_employee?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  // Add visibility change listener to refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRequests();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchRequests = async (showSuccessToast = false) => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      const url = statusFilter 
        ? `/api/admin/dashboard/recent-requests?status=${statusFilter}`
        : '/api/admin/dashboard/recent-requests';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        let filteredRequests = data.requests;
        
        // Client-side filtering as fallback
        if (statusFilter && filteredRequests) {
          filteredRequests = filteredRequests.filter((req: Request) => req.status === statusFilter);
        }
        
        setRequests(filteredRequests);
        if (showSuccessToast) {
          success('Requests refreshed successfully!');
        }
      } else {
        setError('Failed to fetch requests');
        showError('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'pending-confirmation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <div className="mt-2 text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')} Requests` : 'Service Requests'}
          </h1>
          <p className="text-gray-600 mt-1">
            {statusFilter ? `Manage ${statusFilter.replace('-', ' ')} service requests` : 'Manage all service requests from customers'}
          </p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('-', ' ')} Service Requests` : 'All Service Requests'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No requests found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{request.full_name}</div>
                        <div className="text-sm text-gray-500 truncate">{request.contact_no}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {request.service === 'laptop' && '💻'}
                          {request.service === 'computer' && '🖥️'}
                          {request.service === 'mobile' && '📱'}
                          {request.service === 'tv' && '📺'}
                          {request.service === 'camera' && '📷'}
                          {request.service === 'tablet' && '📱'}
                          {request.service === 'smartwatch' && '⌚'}
                          {request.service === 'game_console' && '🎮'}
                          {request.service === 'e_readers' && '📖'}
                          {request.service === 'headphones' && '🎧'}
                          {request.service === 'microwave' && '🔥'}
                          {request.service === 'refrigerator' && '❄️'}
                          {request.service === 'washing_machine' && '🧺'}
                          {request.service === 'air_conditioner' && '❄️'}
                          {request.service === 'smart_speakers' && '🔊'}
                          {request.service === 'printers' && '🖨️'}
                          {request.service === 'projectors' && '📽️'}
                          {request.service === 'routers' && '📡'}
                          {request.service === 'monitors' && '🖥️'}
                          {request.service === 'home_theater' && '🎬'}
                          {request.service === 'speakers' && '🔊'}
                          {!['laptop', 'computer', 'mobile', 'tv', 'camera', 'tablet', 'smartwatch', 'game_console', 'e_readers', 'headphones', 'microwave', 'refrigerator', 'washing_machine', 'air_conditioner', 'smart_speakers', 'printers', 'projectors', 'routers', 'monitors', 'home_theater', 'speakers'].includes(request.service) && '🔧'}
                        </span>
                        <div>
                          <div className="text-sm text-gray-900 capitalize">{request.service}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[120px]">{request.brand_name} {request.model_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.assigned_employee ? (
                        <div>
                          <div className="font-medium text-gray-900">{request.assigned_employee.full_name}</div>
                          <div className="text-xs text-gray-400">{request.assigned_employee.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/requests/${request.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ transform: `translateY(${index * 60}px)` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
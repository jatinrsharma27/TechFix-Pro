'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
import { sendNotification } from '@/lib/notifications';

interface Request {
  id: string;
  customer_name: string;
  device_type: string;
  brand_name: string;
  model_name: string;
  issue_description: string;
  status: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  contact_no: string;
  email: string;
  address: string;
}

export default function EmployeeRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filter]);

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
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const sessionToken = localStorage.getItem('employee_session_token');
      if (!sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      const response = await fetch('/api/employee/requests', {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
        setError(null);
      } else if (response.status === 401) {
        localStorage.removeItem('employee_session_token');
        localStorage.removeItem('employee');
        router.push('/employee/Auth/Signin');
      } else {
        setError('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('An error occurred while fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const sessionToken = localStorage.getItem('employee_session_token');
      if (!sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      const response = await fetch('/api/employee/update-request-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        const request = requests.find(r => r.id === requestId);
        if (action === 'accept') {
          success('Request accepted successfully!');
          // Get user ID from request data
          const requestResponse = await fetch(`/api/requests/${requestId}`);
          const requestData = await requestResponse.json();
          const actualUserId = requestData.user_id || requestData.contact_id;
          
          // Send notification to admin and user
          await sendNotification({
            recipient_type: 'user',
            recipient_id: actualUserId,
            request_id: requestId,
            type: 'status_update',
            title: 'Request Accepted',
            message: `Your ${request?.device_type} repair request has been accepted by our technician`,
            priority: 'normal'
          });
          setTimeout(() => {
            router.push('/employee/dashboard');
          }, 1000);
        } else if (action === 'reject') {
          success('Request rejected successfully!');
          // Get user ID from request data
          const requestResponse = await fetch(`/api/requests/${requestId}`);
          const requestData = await requestResponse.json();
          const actualUserId = requestData.user_id || requestData.contact_id;
          
          // Send notification to admin and user
          await sendNotification({
            recipient_type: 'user',
            recipient_id: actualUserId,
            request_id: requestId,
            type: 'status_update',
            title: 'Request Rejected',
            message: `Your ${request?.device_type} repair request has been rejected`,
            priority: 'high'
          });
          await fetchRequests();
        }
      } else {
        try {
          const errorData = await response.json();
          showError(errorData.error || `Failed to ${action} request`);
        } catch {
          showError(`Failed to ${action} request`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`An error occurred while ${action}ing the request`);
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

  // Remove duplicates and filter requests
  const uniqueRequests = requests.filter((request, index, self) => 
    index === self.findIndex(r => r.id === request.id)
  );
  
  // Apply status filter
  const statusFilteredRequests = filter === 'all' 
    ? uniqueRequests 
    : uniqueRequests.filter(request => request.status === filter);
  
  // Apply search filter
  const filteredRequests = searchQuery.trim() === '' 
    ? statusFilteredRequests
    : statusFilteredRequests.filter(request => {
        const query = searchQuery.toLowerCase();
        const matches = (
          (request.id || '').toLowerCase().includes(query) ||
          (request.customer_name || '').toLowerCase().includes(query) ||
          (request.device_type || '').toLowerCase().includes(query) ||
          (request.brand_name || '').toLowerCase().includes(query) ||
          (request.model_name || '').toLowerCase().includes(query) ||
          (request.contact_no || '').includes(searchQuery) ||
          (request.email || '').toLowerCase().includes(query)
        );
        
        // Debug log for first request
        if (statusFilteredRequests.indexOf(request) === 0 && searchQuery) {
          console.log('Search Debug:', {
            query: searchQuery,
            request: {
              id: request.id,
              customer_name: request.customer_name,
              device_type: request.device_type,
              brand_name: request.brand_name,
              model_name: request.model_name,
              contact_no: request.contact_no,
              email: request.email
            },
            matches
          });
        }
        
        return matches;
      });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-gray-600 mt-1">
            View and manage your assigned service requests
          </p>
        </div>
        <button
          onClick={() => fetchRequests()}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Request ID, Customer Name, Device Type, Brand, Model, or Contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', name: 'All Requests' },
            { id: 'pending-confirmation', name: 'Pending Confirmation' },
            { id: 'assigned', name: 'Assigned' },
            { id: 'in-progress', name: 'In Progress' },
            { id: 'completed', name: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                filter === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === 'all' ? 'All Requests' : filter.charAt(0).toUpperCase() + filter.slice(1)} ({filteredRequests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No {filter === 'all' ? '' : filter} requests found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request, index) => (
                  <tr key={`${request.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {request.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{request.customer_name}</div>
                        <div className="text-xs text-gray-700 truncate">{request.contact_no}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {request.device_type === 'air_conditioner' && '❄️'}
                          {request.device_type === 'camera' && '📷'}
                          {request.device_type === 'computer' && '🖥️'}
                          {request.device_type === 'e_readers' && '📖'}
                          {request.device_type === 'game_console' && '🎮'}
                          {request.device_type === 'headphones' && '🎧'}
                          {request.device_type === 'home_theater' && '🎬'}
                          {request.device_type === 'laptop' && '💻'}
                          {request.device_type === 'microwave' && '🔥'}
                          {request.device_type === 'mobile' && '📱'}
                          {request.device_type === 'monitors' && '🖥️'}
                          {request.device_type === 'printers' && '🖨️'}
                          {request.device_type === 'projectors' && '📽️'}
                          {request.device_type === 'refrigerator' && '❄️'}
                          {request.device_type === 'routers' && '📡'}
                          {request.device_type === 'smart_speakers' && '🔊'}
                          {request.device_type === 'smartwatch' && '⌚'}
                          {request.device_type === 'speakers' && '🔊'}
                          {request.device_type === 'tablet' && '📱'}
                          {request.device_type === 'tv' && '📺'}
                          {request.device_type === 'washing_machine' && '🧺'}
                          {!['air_conditioner', 'camera', 'computer', 'e_readers', 'game_console', 'headphones', 'home_theater', 'laptop', 'microwave', 'mobile', 'monitors', 'printers', 'projectors', 'refrigerator', 'routers', 'smart_speakers', 'smartwatch', 'speakers', 'tablet', 'tv', 'washing_machine'].includes(request.device_type) && '🔧'}
                        </span>
                        <div>
                          <div className="text-sm text-gray-900 capitalize">{request.device_type}</div>
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
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending-confirmation' ? (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'accept')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push(`/employee/requests/${request.id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            View Details
                          </button>
                        )}
                      </div>
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
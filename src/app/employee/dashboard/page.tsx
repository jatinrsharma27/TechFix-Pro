'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  assignedRequests: number;
  completedRequests: number;
  pendingRequests: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  services: {
    laptop: number;
    computer: number;
    mobile: number;
    tv: number;
    camera: number;
    tablet: number;
  };
}

interface RecentRequest {
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
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    assignedRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    services: { laptop: 0, computer: 0, mobile: 0, tv: 0, camera: 0, tablet: 0 }
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      const employeeData = localStorage.getItem('employee');
      const sessionToken = localStorage.getItem('employee_session_token');
      
      if (!employeeData || !sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      // Fetch stats - this now includes earnings from work_completion_payments
      try {
        const statsResponse = await fetch('/api/employee/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Stats error:', error);
      }

      // Fetch requests
      try {
        const requestsResponse = await fetch('/api/employee/dashboard/recent-requests', {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setRecentRequests(requestsData.requests || []);
        }
      } catch (error) {
        console.error('Requests error:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
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
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's assigned to you today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Requests</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.assignedRequests)}</p>
              <p className="text-xs text-yellow-600 mt-1">Current workload</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Requests</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.completedRequests)}</p>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
              <p className="text-xs text-blue-600 mt-1">Lifetime earnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthEarnings)}</p>
              <p className="text-xs text-purple-600 mt-1">Current earnings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Recent Service Requests</h3>
            <button
              onClick={() => router.push('/employee/requests')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No recent requests assigned to you</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    No.
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
                {recentRequests.slice(0, 8).map((request, index) => (
                  <tr key={`${request.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-8">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{request.customer_name}</div>
                        <div className="text-xs font-medium text-gray-900 truncate">{request.contact_no}</div>
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
                          <div className="text-xs text-gray-700 truncate max-w-[120px]">{request.brand_name} {request.model_name}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/employee/requests/${request.id}`)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

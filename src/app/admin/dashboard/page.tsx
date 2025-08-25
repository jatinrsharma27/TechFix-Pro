'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  activeEngineers: number;
  totalRevenue: number;
  monthlyTrend: { month: string; revenue: number }[];
  serviceBreakdown: { service: string; revenue: number }[];
  thisMonthUsers: number;
  thisMonthRequests: number;
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

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    activeEngineers: 0,
    totalRevenue: 0,
    monthlyTrend: [],
    serviceBreakdown: [],
    thisMonthUsers: 0,
    thisMonthRequests: 0,
    services: { laptop: 0, computer: 0, mobile: 0, tv: 0, camera: 0, tablet: 0 }
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, value: number, label: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');

      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      // Fetch stats
      try {
        const statsResponse = await fetch(`/api/admin/dashboard/stats?period=${chartPeriod}`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (statsResponse.ok) {
          const statsText = await statsResponse.text();
          if (statsText.trim().startsWith('{')) {
            try {
              const statsData = JSON.parse(statsText);
              setStats(statsData);
            } catch (parseError) {
              console.error('Stats JSON parse error:', parseError);
              console.error('Stats response:', statsText);
            }
          } else {
            console.error('Invalid stats response format:', statsText);
          }
        }
      } catch (error) {
        console.error('Stats error:', error);
      }

      // Fetch revenue data
      try {
        const revenueResponse = await fetch('/api/admin/revenue', {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (revenueResponse.ok) {
          const revenueData = await revenueResponse.json();
          setStats(prev => ({
            ...prev,
            totalRevenue: revenueData.totalRevenue || 0
          }));
        }
      } catch (error) {
        console.error('Revenue error:', error);
      }

      // Fetch requests
      try {
        const requestsResponse = await fetch('/api/admin/dashboard/recent-requests', {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (requestsResponse.ok) {
          const requestsText = await requestsResponse.text();
          if (requestsText.trim().startsWith('{')) {
            try {
              const requestsData = JSON.parse(requestsText);
              setRecentRequests(requestsData.requests);
            } catch (parseError) {
              console.error('Requests JSON parse error:', parseError);
              console.error('Requests response:', requestsText);
            }
          } else {
            console.error('Invalid requests response format:', requestsText);
          }
        }
      } catch (error) {
        console.error('Requests error:', error);
      }

      // Fetch chart data
      try {
        const chartResponse = await fetch(`/api/admin/dashboard/chart-data?period=${chartPeriod}`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (chartResponse.ok) {
          const chartText = await chartResponse.text();
          if (chartText.trim().startsWith('{')) {
            try {
              const chartData = JSON.parse(chartText);
              setChartData(chartData.chartData);
            } catch (parseError) {
              console.error('Chart JSON parse error:', parseError);
              console.error('Chart response:', chartText);
            }
          } else {
            console.error('Invalid chart response format:', chartText);
          }
        }
      } catch (error) {
        console.error('Chart error:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with TechFix Pro today.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingRequests)}</p>
              <p className="text-xs text-yellow-600 mt-1">Current workload</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-xs text-green-600 mt-1">Customer base size</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Engineers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeEngineers)}</p>
              <p className="text-xs text-blue-600 mt-1">Available workforce</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-purple-600 mt-1">Business health</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <div className="flex space-x-2">
              {[
                { id: 'weekly', label: 'Weekly', icon: '📅' },
                { id: 'monthly', label: 'Monthly', icon: '📅' },
                { id: 'yearly', label: 'Yearly', icon: '📅' },
                { id: '10years', label: '10 Years', icon: '📅' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setChartPeriod(filter.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    chartPeriod === filter.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 relative">
            {stats.monthlyTrend && stats.monthlyTrend.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const maxRevenue = Math.max(...stats.monthlyTrend.map(d => d.revenue));
                  const value = (maxRevenue / 4) * (4 - i);
                  return (
                    <text key={i} x="5" y={40 + i * 40} className="text-xs fill-gray-500">
                      ₹{value > 1000 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0)}
                    </text>
                  );
                })}
                
                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points={stats.monthlyTrend.map((item, index) => {
                    const maxRevenue = Math.max(...stats.monthlyTrend.map(d => d.revenue)) || 1;
                    const x = 50 + (index * (350 / (stats.monthlyTrend.length - 1)));
                    const y = 180 - ((item.revenue / maxRevenue) * 140);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                
                {/* Data points with hover */}
                {stats.monthlyTrend.map((item, index) => {
                  const maxRevenue = Math.max(...stats.monthlyTrend.map(d => d.revenue)) || 1;
                  const x = 50 + (index * (350 / (stats.monthlyTrend.length - 1)));
                  const y = 180 - ((item.revenue / maxRevenue) * 140);
                  return (
                    <g key={index}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="6" 
                        fill="#10b981" 
                        className="cursor-pointer hover:fill-green-700"
                        onMouseEnter={() => setHoveredPoint({x, y, value: item.revenue, label: item.month})}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <text x={x} y="195" className="text-xs fill-gray-600 text-center" textAnchor="middle">
                        {item.month.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
                
                {/* Tooltip */}
                {hoveredPoint && (
                  <g>
                    <rect 
                      x={hoveredPoint.x - 40} 
                      y={hoveredPoint.y - 35} 
                      width="80" 
                      height="25" 
                      fill="#1f2937" 
                      rx="4" 
                      opacity="0.9"
                    />
                    <text 
                      x={hoveredPoint.x} 
                      y={hoveredPoint.y - 18} 
                      className="text-xs fill-white" 
                      textAnchor="middle"
                    >
                      ₹{hoveredPoint.value.toLocaleString('en-IN')}
                    </text>
                  </g>
                )}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service Type</h3>
          <div className="space-y-3">
            {stats.serviceBreakdown && stats.serviceBreakdown.length > 0 ? (
              stats.serviceBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item.service}</span>
                  <span className="font-medium">{formatCurrency(item.revenue)}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No service data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Service Requests</h3>
            <button
              onClick={() => router.push('/admin/requests')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No recent requests</p>
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
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-16">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{request.full_name}</div>
                        <div className="text-xs text-gray-500 truncate">{request.contact_no}</div>
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
    </div>
  );
}
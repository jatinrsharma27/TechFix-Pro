'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  thisWeekRevenue: number;
  monthlyTrend: { month: string; revenue: number }[];
  serviceBreakdown: { service: string; revenue: number }[];
}

interface Transaction {
  id: string;
  request_id: string;
  customer_name: string;
  service: string;
  amount: number;
  payment_date: string;
  employee_name: string;
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    thisWeekRevenue: 0,
    monthlyTrend: [],
    serviceBreakdown: []
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, value: number, label: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRevenueData();
  }, [chartPeriod]);

  const fetchRevenueData = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      const [statsResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/admin/revenue/stats?period=${chartPeriod}`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        }),
        fetch('/api/admin/revenue/transactions', {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
          <p className="text-gray-600 mt-1">
            Track business earnings and payment analytics
          </p>
        </div>
        <button
          onClick={fetchRevenueData}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">All time earnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthRevenue)}</p>
              <p className="text-xs text-blue-600 mt-1">Current month</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisWeekRevenue)}</p>
              <p className="text-xs text-purple-600 mt-1">Last 7 days</p>
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
            {stats.monthlyTrend.length > 0 ? (
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
            {stats.serviceBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.service}</span>
                <span className="font-medium">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">💰</div>
              <p>No transactions found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collected By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.request_id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {transaction.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.employee_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/revenue/${transaction.id}`)}
                        className="text-blue-600 hover:text-blue-900"
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
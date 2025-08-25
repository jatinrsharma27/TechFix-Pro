'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface RevenueDetail {
  id: string;
  request_id: string;
  customer_name: string;
  contact_no: string;
  email: string;
  address: string;
  service: string;
  brand_name: string;
  model_name: string;
  description: string;
  amount: number;
  payment_date: string;
  employee_name: string;
  employee_id: string;
}

export default function RevenueDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [detail, setDetail] = useState<RevenueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchRevenueDetail();
    }
  }, [id]);

  const fetchRevenueDetail = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      const response = await fetch(`/api/admin/revenue/details/${id}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDetail(data.detail);
      } else {
        setError('Failed to fetch revenue details');
      }
    } catch (error) {
      console.error('Error fetching revenue detail:', error);
      setError('An error occurred while fetching revenue details');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-700 mt-2">{error || 'Revenue detail not found'}</p>
          <button
            onClick={() => router.push('/admin/revenue')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Revenue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Details</h1>
          <p className="text-gray-600 mt-1">Request #{detail.request_id.substring(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRevenueDetail}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => router.push('/admin/revenue')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Revenue
          </button>
        </div>
      </div>

      {/* Payment Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-green-900">Payment Received</h2>
            <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(detail.amount)}</p>
            <p className="text-sm text-green-600 mt-1">Collected on {formatDate(detail.payment_date)}</p>
          </div>
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Customer Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{detail.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium text-gray-900">{detail.contact_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{detail.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{detail.address}</p>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Service Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Service Type</p>
              <p className="font-medium text-gray-900 capitalize">{detail.service}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Brand & Model</p>
              <p className="font-medium text-gray-900">{detail.brand_name} {detail.model_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Request ID</p>
              <p className="font-medium text-gray-900">#{detail.request_id.substring(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issue Description</p>
              <p className="font-medium text-gray-900">{detail.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-3">Payment Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Amount Charged</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(detail.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Date</p>
            <p className="font-medium text-gray-900">{formatDate(detail.payment_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Collected By</p>
            <p className="font-medium text-gray-900">{detail.employee_name}</p>
            <p className="text-xs text-gray-500">Employee ID: {detail.employee_id.substring(0, 8)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
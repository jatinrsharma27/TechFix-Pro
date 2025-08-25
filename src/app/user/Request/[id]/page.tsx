'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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
  assigned_employee?: {
    id: string;
    full_name: string;
    email: string;
  };
  work_completion?: WorkCompletion;
}

interface WorkCompletion {
  id: string;
  title: string;
  work_details: string;
  total_payment_amount: string;
  employee_income: string;
  company_revenue: string;
  payment_method: string;
  payment_status: string;
  completed_at: string;
  notes?: string;
}

export default function RequestDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [request, setRequest] = useState<Request | null>(null);
  const [formDetails, setFormDetails] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'all';

  useEffect(() => {
    fetchRequest();
    fetchFormDetails();
  }, [unwrappedParams.id]);

  // Add a refresh effect when the component mounts
  useEffect(() => {
    // Refresh the request data when the component mounts
    const refreshInterval = setInterval(() => {
      fetchRequest();
      fetchFormDetails();
    }, 30000); // Refresh every 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [unwrappedParams.id]);

  // Add visibility change listener to refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRequest();
        fetchFormDetails();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [unwrappedParams.id]);

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/completion-details?requestId=${unwrappedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormDetails(data.formDetails || []);
        setPaymentData(data.paymentData || null);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    }
  };

  const fetchRequest = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch the specific request by ID with all details
      const response = await fetch(`/api/user/requests/${unwrappedParams.id}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('An error occurred while fetching request details');
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-yellow-800">Request Not Found</h3>
              </div>
              <div className="mt-2 text-yellow-700">
                <p>The requested service request could not be found.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/user/Request')}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                >
                  View All Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-25">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
              <p className="text-gray-600 mt-1">
                View details of your service request
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchRequest();
                  fetchFormDetails();
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => router.push('/user/Request')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Requests
              </button>
            </div>
          </div>

          {/* Request Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Service Request #{request.id.substring(0, 8)}</h2>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Created on {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-4xl">
                  {request.device_type === 'laptop' && '💻'}
                  {request.device_type === 'computer' && '🖥️'}
                  {request.device_type === 'mobile' && '📱'}
                  {request.device_type === 'tv' && '📺'}
                  {request.device_type === 'camera' && '📷'}
                  {request.device_type === 'tablet' && '📱'}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{request.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{request.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{request.contact_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{request.address}</p>
                    </div>
                  </div>
                </div>

                {/* Device Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Device Type</p>
                      <p className="font-medium capitalize">{request.device_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{request.brand_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{request.model_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Description</p>
                      <p className="font-medium">{request.issue_description}</p>
                    </div>
                    {/* Assigned Employee Information */}
                    {request.assigned_employee && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Assigned Technician</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{request.assigned_employee.full_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{request.assigned_employee.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Form Details */}
                    {formDetails.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-2">Work Updates</h4>
                        <div className="space-y-4">
                          {formDetails.map((form, index) => {
                            const isCompletion = form.form_type === 'completion';
                            const isCancellation = form.form_type === 'cancellation';
                            return (
                            <div key={index} className={`p-3 rounded-lg border ${
                              isCompletion ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  isCompletion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isCompletion ? 'Work Completed' : 'Request Cancelled'}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(form.created_at)}</span>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm text-gray-500">Title</p>
                                  <p className="font-medium">{form.title}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  <p className="font-medium capitalize">{form.reason.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Details</p>
                                  <p className="font-medium">{form.details}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Details</p>
                                  <p className="font-medium">{form.details}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Completed At</p>
                                  <p className="font-medium">{formatDate(form.completed_at || form.created_at)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Updated By</p>
                                  <p className="font-medium">{isCompletion ? (form.submitted_by || form.employees?.full_name || 'Technician') : 'Admin'}</p>
                                </div>
                                {paymentData && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-2">Payment Information</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <p className="text-gray-500">Total Amount Paid</p>
                                        <p className="font-medium">₹{parseFloat(paymentData.total_payment_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Payment Method</p>
                                        <p className="font-medium capitalize">{paymentData.payment_method}</p>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                      Payment Date: {new Date(paymentData.payment_date).toLocaleDateString('en-IN')}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm text-gray-500">Completed At</p>
                                  <p className="font-medium">{formatDate(form.completed_at || form.created_at)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Updated By</p>
                                  <p className="font-medium">{isCompletion ? (form.submitted_by || form.employees?.full_name || 'Technician') : 'Admin'}</p>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Completion & Payment Details */}
              {request.work_completion && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Work Completion & Payment Details</h3>
                  <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-medium text-green-800 mb-3">Work Details</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Title</p>
                            <p className="font-medium">{request.work_completion.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Work Description</p>
                            <p className="font-medium">{request.work_completion.work_details}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Completed Date</p>
                            <p className="font-medium">{formatDate(request.work_completion.completed_at)}</p>
                          </div>
                          {request.work_completion.notes && (
                            <div>
                              <p className="text-sm text-gray-500">Notes</p>
                              <p className="font-medium">{request.work_completion.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-green-800 mb-3">Payment Information</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Total Payment Amount</p>
                            <p className="font-bold text-lg text-gray-900">₹{parseFloat(request.work_completion.total_payment_amount).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                              {request.work_completion.payment_method}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              request.work_completion.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.work_completion.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.work_completion.payment_status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Request Status</h3>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Last updated on {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
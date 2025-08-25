'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';

interface Request {
  id: string;
  full_name: string;
  contact_no: string;
  email: string;
  address: string;
  service: string;
  description: string;
  created_at: string;
  brand_name: string;
  model_name: string;
  assigned_to: string;
  status: string;
  work_completion?: {
    title: string;
    work_details: string;
    completed_at: string;
    notes?: string;
    total_payment_amount: string;
    employee_income: string;
    company_revenue: string;
    payment_method: string;
    payment_status: string;
  };
}

export default function RequestDetail() {
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [completionForm, setCompletionForm] = useState({
    title: '',
    reason: 'work_completed',
    details: ''
  });
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [reportForm, setReportForm] = useState({
    title: '',
    reason: 'on_hold',
    details: ''
  });
  const [formDetails, setFormDetails] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  useEffect(() => {
    fetchRequestDetail();
    fetchFormDetails();
    // Get employee data from localStorage
    const empData = localStorage.getItem('employee');
    if (empData) {
      setEmployeeData(JSON.parse(empData));
    }
  }, [requestId]);

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/completion-details?requestId=${requestId}`);
      if (response.ok) {
        const data = await response.json();
        setFormDetails(data.formDetails || []);
        setPaymentData(data.paymentData || null);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    }
  };

  const fetchRequestDetail = async () => {
    try {
      const sessionToken = localStorage.getItem('employee_session_token');
      
      if (!sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      const response = await fetch(`/api/employee/requests/${requestId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
      } else {
        setError('Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      setError('An error occurred while fetching request details');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      const sessionToken = localStorage.getItem('employee_session_token');
      
      if (!sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      const response = await fetch('/api/employee/report-issue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          ...reportForm
        }),
      });

      if (response.ok) {
        setShowReportForm(false);
        await fetchRequestDetail();
        await fetchFormDetails();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      setError('An error occurred while reporting issue');
    } finally {
      setProcessing(false);
    }
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      const sessionToken = localStorage.getItem('employee_session_token');
      
      if (!sessionToken) {
        router.push('/employee/Auth/Signin');
        return;
      }

      const response = await fetch('/api/employee/complete-work', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          ...completionForm
        }),
      });

      if (response.ok) {
        setShowCompletionForm(false);
        setShowPaymentForm(true); // Show payment form after completion
        await fetchRequestDetail();
        await fetchFormDetails();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete work');
      }
    } catch (error) {
      console.error('Error completing work:', error);
      setError('An error occurred while completing work');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (action: 'accept' | 'reject' | 'start' | 'complete' | 'cancel') => {
    try {
      setProcessing(true);
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
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      if (response.ok) {
        await fetchRequestDetail();
        if (action === 'reject') {
          router.push('/employee/requests');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(`An error occurred while ${action}ing the request`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending-confirmation': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
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

  if (error || !request) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-700 mt-2">{error || 'Request not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
          <p className="text-gray-600 mt-1">Request #{request.id.substring(0, 8)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <p><span className="font-medium text-gray-600">Name:</span> {request.full_name}</p>
              <p><span className="font-medium text-gray-600">Phone:</span> {request.contact_no}</p>
              <p><span className="font-medium text-gray-600">Email:</span> {request.email}</p>
              <p><span className="font-medium text-gray-600">Address:</span> {request.address}</p>
              <p><span className="font-medium text-gray-600">Created:</span> {formatDate(request.created_at)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
            <div className="space-y-3">
              <p><span className="font-medium text-gray-600">Service Type:</span> {request.service}</p>
              <p><span className="font-medium text-gray-600">Brand:</span> {request.brand_name}</p>
              <p><span className="font-medium text-gray-600">Model:</span> {request.model_name}</p>
              <div>
                <span className="font-medium text-gray-600">Description:</span>
                <p className="mt-1 text-gray-900">{request.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            {/* Pending Confirmation Status: Show Accept/Reject */}
            {request.status === 'pending-confirmation' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('accept')}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {processing ? 'Processing...' : 'Accept Request'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('reject')}
                  disabled={processing}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {processing ? 'Processing...' : 'Reject Request'}
                </button>
              </>
            )}

            {/* Assigned Status: Show Start Work */}
            {request.status === 'assigned' && (
              <button
                onClick={() => handleStatusUpdate('start')}
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {processing ? 'Processing...' : 'Start Work'}
              </button>
            )}

            {/* In-Progress Status: Show Complete and Report Issue */}
            {request.status === 'in-progress' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompletionForm(true)}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Completed
                </button>
                <button
                  onClick={() => setShowReportForm(true)}
                  disabled={processing}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Report Issue
                </button>
              </div>
            )}

            {/* Completed Status: No actions */}
            {request.status === 'completed' && (
              <div className="text-gray-500 italic">
                Request is completed. No further actions available.
              </div>
            )}
            
            {/* Cancelled Status: Request removed */}
            {request.status === 'cancelled' && (
              <div className="text-red-500 italic">
                This request has been cancelled by admin.
              </div>
            )}
          </div>

          {/* Form Submissions History */}
          {formDetails.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Form Submissions</h3>
              <div className="space-y-4">
                {formDetails.filter(form => form.form_type === 'completion').map((form, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-green-50/30 border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                        Work Completed
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

                      {paymentData && (
                        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-2">Payment Details</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Total Payment</p>
                              <p className="font-medium">₹{parseFloat(paymentData.total_payment_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Your Income (25%)</p>
                              <p className="font-medium text-green-600">₹{parseFloat(paymentData.employee_income).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Company Revenue (75%)</p>
                              <p className="font-medium text-blue-600">₹{parseFloat(paymentData.company_revenue).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Payment Method: {paymentData.payment_method} | Date: {new Date(paymentData.payment_date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Completed At</p>
                        <p className="font-medium">{formatDate(form.completed_at || form.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submitted By</p>
                        <p className="font-medium">{form.submitted_by || form.employees?.full_name || 'Employee'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Your Share (25%)</p>
                          <p className="font-medium text-green-600">₹{parseFloat(request.work_completion.employee_income).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Company Share (75%)</p>
                          <p className="font-medium text-blue-600">₹{parseFloat(request.work_completion.company_revenue).toFixed(2)}</p>
                        </div>
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
        </div>
      </div>

      {/* Completion Form Modal */}
      {showCompletionForm && (
        <div className="fixed inset-0 border-t border-gray-200 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Complete Work</h3>
              <button
                onClick={() => setShowCompletionForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCompletionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={completionForm.title}
                  onChange={(e) => setCompletionForm({...completionForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Work completion title"
                  required
                />
              </div>
              

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={completionForm.reason}
                  onChange={(e) => setCompletionForm({...completionForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="work_completed">Work Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={completionForm.details}
                  onChange={(e) => setCompletionForm({...completionForm, details: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the work completed..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Next Step'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompletionForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Report Issue</h3>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Issue title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={reportForm.reason}
                  onChange={(e) => setReportForm({...reportForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={reportForm.details}
                  onChange={(e) => setReportForm({...reportForm, details: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe the issue..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Done'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Process Payment</h3>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <PaymentForm
              requestId={requestId}
              customerName={request?.full_name}
              customerEmail={request?.email}
              onPaymentSuccess={() => {
                setShowPaymentForm(false);
                router.push('/employee/requests');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
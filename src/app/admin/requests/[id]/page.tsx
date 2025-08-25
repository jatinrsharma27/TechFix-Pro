'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  assigned_to?: string;
  assigned_employee?: Employee;
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

interface Employee {
  id: string;
  full_name: string;
  email: string;
  status?: 'free' | 'busy' | 'rejected';
  canAssign?: boolean;
}

export default function AdminRequestDetails() {
  const params = useParams();
  const id = params?.id as string;
  const [request, setRequest] = useState<Request | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formDetails, setFormDetails] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancellationForm, setCancellationForm] = useState({
    title: '',
    reason: '',
    details: ''
  });
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    if (id) {
      fetchRequest();
      fetchEmployees();
      fetchCompletionDetails();
    }
  }, [id]);

  // Add visibility change listener to refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && id) {
        fetchRequest();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  const fetchRequest = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      // Fetch the specific request by ID with all details
      const response = await fetch(`/api/admin/requests/${id}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
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

  const fetchCompletionDetails = async () => {
    try {
      const response = await fetch(`/api/completion-details?requestId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormDetails(data.formDetails || []);
        setPaymentData(data.paymentData || null);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      const response = await fetch(`/api/admin/employees-status?requestId=${id}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateRequestStatus = async (newStatus: string) => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      // If status is "in-progress", show assign dropdown
      if (newStatus === 'in-progress') {
        setShowAssignDropdown(true);
        return;
      }

      // For other statuses, update directly
      console.log('Updating status:', { requestId: id, status: newStatus });
      const response = await fetch('/api/admin/update-request-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: id,
          status: newStatus,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        // Update local state
        if (request) {
          // If status is cancelled, clear the assigned_to field
          if (newStatus === 'cancelled') {
            setRequest({ ...request, status: newStatus, assigned_to: undefined, assigned_employee: undefined });
          } else {
            setRequest({ ...request, status: newStatus });
          }
        }
        success(`Request status updated to ${newStatus}`);
        // Send notification
        await sendNotification({
          recipient_type: 'user',
          recipient_id: request?.customer_name || 'unknown',
          request_id: id,
          type: 'status_update',
          title: 'Status Updated',
          message: `Request status changed to ${newStatus}`,
          priority: 'normal'
        });
      } else {
        const errorData = await response.json();
        console.error('Status update error:', errorData);
        showError(errorData.error || 'Failed to update request status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('An error occurred while updating request status');
    }
  };

  const handleCancellationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      const response = await fetch('/api/admin/cancel-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: id,
          ...cancellationForm
        }),
      });

      if (response.ok) {
        setShowCancellationForm(false);
        await fetchRequest();
        success('Request cancelled successfully');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      showError('An error occurred while cancelling request');
    }
  };

  const assignRequestToEmployee = async () => {
    try {
      const adminData = localStorage.getItem('admin');
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!adminData || !sessionToken) {
        router.push('/admin/Auth/Signin');
        return;
      }

      if (!selectedEmployee) {
        alert('Please select an employee');
        return;
      }

      console.log('Assigning request:', { requestId: id, employeeId: selectedEmployee });
      
      const response = await fetch('/api/admin/simple-assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: id,
          employeeId: selectedEmployee,
        }),
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        showError('Invalid response from server');
        return;
      }

      if (response.ok) {
        const assignedEmployee = employees.find(emp => emp.id === selectedEmployee);
        
        if (request) {
          setRequest({
            ...request,
            status: 'assigned',
            assigned_to: selectedEmployee,
            assigned_employee: assignedEmployee,
          });
        }
        setShowAssignDropdown(false);
        setSelectedEmployee('');
        success('Request assigned successfully!');
      } else {
        console.error('Assignment error:', data);
        showError(data.error || 'Failed to assign request');
      }
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('An error occurred while assigning request');
    }
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

  if (!request) {
    return (
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
              onClick={() => router.push('/admin/requests')}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              View All Requests
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
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
          <p className="text-gray-600 mt-1">
            View and manage this service request
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchRequest();
              fetchCompletionDetails();
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => router.push('/admin/requests')}
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
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('-', ' ').toUpperCase()}
                </span>
                {/* {request.assigned_to && (
                  <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    ASSIGNED
                  </span>
                )} */}
                <span className="text-sm text-gray-500">
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
                  <p className="font-medium text-black">{request.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-black">{request.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-black">{request.contact_no}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-black">{request.address}</p>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Device Type</p>
                  <p className="font-medium text-black capitalize">{request.device_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium not-first:text-black">{request.brand_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium text-black">{request.model_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Description</p>
                  <p className="font-medium text-black">{request.issue_description}</p>
                </div>
                {/* Assigned Employee Information */}
                {request.assigned_employee && (
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Assigned Employee</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-black">{request.assigned_employee.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-black">{request.assigned_employee.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Form Details */}
                {formDetails.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Employee Form Submissions</h4>
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
                              <p className="font-medium text-black">{form.title}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="font-medium capitalize text-black">{form.reason.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Details</p>
                              <p className="font-medium text-black">{form.details}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Details</p>
                              <p className="font-medium text-black">{form.details}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Completed At</p>
                              <p className="font-medium text-black">{formatDate(form.completed_at || form.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Submitted By</p>
                              <p className="font-medium text-black">{isCompletion ? (form.submitted_by || form.employees?.full_name || 'Employee') : 'Admin'}</p>
                            </div>
                            {paymentData && (
                              <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                                <p className="text-sm font-medium text-purple-800 mb-2">Payment Details</p>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500">Total Payment</p>
                                    <p className="font-medium text-black">₹{parseFloat(paymentData.total_payment_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Employee Income (25%)</p>
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
                              <p className="font-medium text-black">{formatDate(form.completed_at || form.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Submitted By</p>
                              <p className="font-medium text-black">{isCompletion ? (form.submitted_by || form.employees?.full_name || 'Employee') : 'Admin'}</p>
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
                        <p className="font-medium text-black">{request.work_completion.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Work Description</p>
                        <p className="font-medium text-black">{request.work_completion.work_details}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed Date</p>
                        <p className="font-medium text-black">{formatDate(request.work_completion.completed_at)}</p>
                      </div>
                      {request.work_completion.notes && (
                        <div>
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="font-medium text-black">{request.work_completion.notes}</p>
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
                          <p className="text-sm text-gray-500">Employee Share (25%)</p>
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

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Request Status</h3>
            <div className="flex flex-wrap gap-3">
              {request.status !== 'cancelled' && request.status !== 'completed' && (
                <button
                  onClick={() => setShowCancellationForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel Request
                </button>
              )}
              
              {request.status === 'on_hold' && (
                <button
                  onClick={() => updateRequestStatus('cancelled')}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel Request
                </button>
              )}
              
              {request.status === 'pending' && (!request.assigned_to || formDetails.some(form => form.reason === 'cancelled')) && (
                <button
                  onClick={() => setShowAssignDropdown(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {request.assigned_to ? 'Reassign Employee' : 'Assign Employee'}
                </button>
              )}
              
            </div>

            {/* Assign Employee Dropdown */}
            {showAssignDropdown && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-md font-medium text-blue-800 mb-3">Assign to Employee</h4>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Select Employee</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((employee) => (
                        <option 
                          key={employee.id} 
                          value={employee.id}
                          disabled={!employee.canAssign}
                          className={!employee.canAssign ? 'text-gray-400' : ''}
                        >
                          {employee.full_name} ({employee.email}) - {employee.status?.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={assignRequestToEmployee}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setShowAssignDropdown(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Cancellation Form Modal */}
      {showCancellationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cancel Request</h3>
              <button
                onClick={() => setShowCancellationForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCancellationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={cancellationForm.title}
                  onChange={(e) => setCancellationForm({...cancellationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Cancellation title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={cancellationForm.reason}
                  onChange={(e) => setCancellationForm({...cancellationForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Reason for cancellation"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={cancellationForm.details}
                  onChange={(e) => setCancellationForm({...cancellationForm, details: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Detailed explanation for cancellation..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancellationForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
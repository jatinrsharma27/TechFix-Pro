'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function IncomeDetail() {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchPaymentDetail();
  }, []);

  const fetchPaymentDetail = async () => {
    try {
      const token = localStorage.getItem('employee_session_token');
      const response = await fetch(`/api/employee/income/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayment(data.payment);
      }
    } catch (error) {
      console.error('Error fetching payment detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!payment) {
    return <div className="p-6">Payment not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {payment.customer_name}</p>
              <p><span className="font-medium">Email:</span> {payment.customer_email}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Payment Date:</span> {new Date(payment.completed_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Payment Method:</span> {payment.payment_method}</p>
              <p><span className="font-medium">Status:</span> {payment.payment_status}</p>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Payment</p>
                <p className="text-2xl font-bold">₹{parseFloat(payment.total_payment_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Your Income (25%)</p>
                <p className="text-2xl font-bold text-green-600">₹{parseFloat(payment.employee_income).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Company Revenue (75%)</p>
                <p className="text-2xl font-bold text-blue-600">₹{parseFloat(payment.company_revenue).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{payment.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  requestId?: string;
  customerName?: string;
  customerEmail?: string;
}

export default function PaymentForm({ 
  onPaymentSuccess, 
  requestId, 
  customerName = '', 
  customerEmail = '' 
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    customerName,
    customerEmail,
    employeeId: '',
    employeeName: '',
    totalAmount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    // Auto-fill employee data from localStorage
    const empData = localStorage.getItem('employee');
    if (empData) {
      const employee = JSON.parse(empData);
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id || '',
        employeeName: employee.full_name || employee.name || ''
      }));
    }
  }, []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requestId,
          totalAmount: parseFloat(formData.totalAmount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Payment processed successfully!\nTotal: ₹${parseFloat(data.payment.totalAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}\nEmployee Income (25%): ₹${parseFloat(data.payment.employeeIncome).toLocaleString('en-IN', {minimumFractionDigits: 2})}\nCompany Revenue (75%): ₹${parseFloat(data.payment.companyRevenue).toLocaleString('en-IN', {minimumFractionDigits: 2})}`);
        onPaymentSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-transparent rounded-lg">
      <h3 className="text-lg font-semibold">Process Payment</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={(e) => setFormData({...formData, customerName: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Customer Email"
          value={formData.customerEmail}
          onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
          className="p-2 border rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Employee Name"
          value={formData.employeeName}
          onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
          className="p-2 border rounded"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          step="0.01"
          placeholder="Total Amount"
          value={formData.totalAmount}
          onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
          className="p-2 border rounded"
          required
        />
        <select
          value={formData.paymentMethod}
          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
          className="p-2 border rounded"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <textarea
        placeholder="Notes (optional)"
        value={formData.notes}
        onChange={(e) => setFormData({...formData, notes: e.target.value})}
        className="w-full p-2 border rounded"
        rows={3}
      />

      {formData.totalAmount && (
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Payment Split Preview:</p>
          <p>Employee Income (25%): ₹{(parseFloat(formData.totalAmount) * 0.25).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
          <p>Company Revenue (75%): ₹{(parseFloat(formData.totalAmount) * 0.75).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Process Payment'}
      </button>
    </form>
  );
}
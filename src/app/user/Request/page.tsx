'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

interface Contact {
  id: string;
  full_name: string;
  contact_no: string;
  email: string;
  address: string | null;
  service: string | null;
  description: string | null;
  brand_name: string | null;
  model_name: string | null;
  status: string;
  created_at: string;
  assigned_to?: string;
  assigned_employee?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export default function Request() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          assigned_employee:employees!assigned_to(
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContacts(data || []);
      success('Requests refreshed successfully!');
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load requests. Please try again.');
      showError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  const getServiceIcon = (service: string | null) => {
    switch (service) {
      case 'air_conditioner': return '❄️';
      case 'camera': return '📷';
      case 'computer': return '🖥️';
      case 'e_readers': return '📖';
      case 'game_console': return '🎮';
      case 'headphones': return '🎧';
      case 'home_theater': return '🎬';
      case 'laptop': return '💻';
      case 'microwave': return '🔥';
      case 'mobile': return '📱';
      case 'monitors': return '🖥️';
      case 'printers': return '🖨️';
      case 'projectors': return '📽️';
      case 'refrigerator': return '❄️';
      case 'routers': return '📡';
      case 'smart_speakers': return '🔊';
      case 'smartwatch': return '⌚';
      case 'speakers': return '🔊';
      case 'tablet': return '📱';
      case 'tv': return '📺';
      case 'washing_machine': return '🧺';
      default: return '🔧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'pending-confirmation': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Requests</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchContacts}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
              <p className="text-gray-600 mt-2">
                View all your submitted service requests and their current status
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
              Total: {contacts.length} requests
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">You haven't submitted any service requests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Type
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Technician
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
                  {contacts.map((contact, index) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-7 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getServiceIcon(contact.service)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {contact.service || 'General Service'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap w-32">
                        <div className="w-32">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {contact.brand_name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {contact.model_name || 'N/A'}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.assigned_employee ? (
                          <div>
                            <div className="font-medium text-gray-900">{contact.assigned_employee.full_name}</div>
                            <div className="text-xs text-gray-400">{contact.assigned_employee.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/user/Request/${contact.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchContacts}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Requests'}
          </button>
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
    </div>
  );
}
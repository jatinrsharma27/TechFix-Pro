import { supabaseAdmin } from './supabaseAdmin';

interface CreateNotificationParams {
  recipient_type: 'admin' | 'employee' | 'user';
  recipient_id: string;
  request_id?: string;
  type: 'new_request' | 'pending_requests' | 'daily_summary' | 'request_created' | 'status_update' | 'engineer_assigned' | 'request_completed' | 'system';
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    console.log('=== CREATING NOTIFICATION ===');
    console.log('Params:', params);
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_type: params.recipient_type,
        recipient_id: params.recipient_id,
        request_id: params.request_id || null,
        type: params.type,
        title: params.title,
        message: params.message,
        priority: params.priority || 'normal'
      })
      .select();

    if (error) {
      console.error('Notification creation error:', error);
      return { success: false, error };
    }

    console.log('Notification created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Notification creation failed:', error);
    return { success: false, error };
  }
}
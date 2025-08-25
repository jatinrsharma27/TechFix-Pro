// app/api/admin/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

// Helper function to get admin ID from request (in a real implementation, this would verify the token)
async function getAdminIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  // In a real implementation, we would verify the JWT token here
  // For now, we'll get the admin ID from localStorage (simulated)
  // This is a simplified approach for demonstration
  return 'admin-id-placeholder'; // This should be replaced with actual admin ID from token verification
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function getServiceIcon(service: string | null): string {
  switch (service?.toLowerCase()) {
    case 'laptop':
      return '💻';
    case 'computer':
      return '🖥️';
    case 'mobile':
      return '📱';
    case 'tv':
      return '📺';
    case 'camera':
      return '📷';
    case 'tablet':
      return '📱';
    default:
      return '🔧';
  }
}

function getRequestPriority(createdAt: string): 'high' | 'normal' | 'low' {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'high'; // Very recent requests are high priority
  if (diffInHours < 24) return 'normal'; // Recent requests are normal priority
  return 'low'; // Older requests have lower notification priority
}

export async function GET(request: NextRequest) {
  try {
    // Get admin ID from request
    // Note: In a real implementation, this would verify the JWT token
    // For now, we'll use a placeholder admin ID for testing
    const adminId = '00000000-0000-0000-0000-000000000000'; // Placeholder admin ID for testing
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get recent contact requests (last 24 hours)
    const { data: recentContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, full_name, service, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (contactsError) {
      throw contactsError;
    }

    // Get pending requests count (older than 1 day)
    const { count: pendingCount, error: pendingError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (pendingError) {
      throw pendingError;
    }

    // Get total requests count for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const { count: todayCount, error: todayError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    if (todayError) {
      throw todayError;
    }

    // Get existing notifications for this admin
    const { data: existingNotifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'admin')
      .eq('recipient_id', adminId)
      .order('created_at', { ascending: false });

    if (notificationsError) {
      throw notificationsError;
    }

    // Create a map of existing notifications by contact ID for quick lookup
    const existingNotificationMap = new Map();
    if (existingNotifications) {
      existingNotifications.forEach(notification => {
        if (notification.contact_id) {
          existingNotificationMap.set(notification.contact_id, notification);
        }
      });
    }

    // Create new notifications for recent contacts that don't already have notifications
    if (recentContacts && recentContacts.length > 0) {
      const newNotifications = [];
      
      for (const contact of recentContacts) {
        // Check if a notification already exists for this contact
        if (!existingNotificationMap.has(contact.id)) {
          // Create a new notification
          newNotifications.push({
            recipient_type: 'admin',
            recipient_id: adminId,
            request_id: contact.id,
            type: 'new_request',
            title: 'New Service Request',
            message: `${contact.full_name} requested ${contact.service || 'general'} service`,
            priority: getRequestPriority(contact.created_at)
          });
        }
      }
      
      // Insert new notifications if any
      if (newNotifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(newNotifications);
          
        if (insertError) {
          console.error('Error inserting new notifications:', insertError);
        }
      }
    }

    // Re-fetch all notifications for this admin (including newly created ones)
    const { data: allNotifications, error: allNotificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', 'admin')
      .eq('recipient_id', adminId)
      .order('created_at', { ascending: false });

    if (allNotificationsError) {
      throw allNotificationsError;
    }

    // Format notifications for the frontend
    const notifications = [];
    
    // Add new contact notifications
    if (allNotifications) {
      allNotifications.forEach(notification => {
        if (notification.type === 'new_request') {
          notifications.push({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: getTimeAgo(new Date(notification.created_at)),
            read: notification.read,
            icon: getServiceIcon(notification.service || null),
            priority: notification.priority
          });
        } else {
          notifications.push({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: getTimeAgo(new Date(notification.created_at)),
            read: notification.read,
            icon: '🔔',
            priority: notification.priority
          });
        }
      });
    }

    // Add pending requests notification if there are pending requests
    if (pendingCount && pendingCount > 0) {
      notifications.push({
        id: 'pending-requests',
        type: 'pending_requests',
        title: 'Pending Requests',
        message: `You have ${pendingCount} pending service requests that need attention`,
        time: 'Ongoing',
        read: false,
        icon: '⏰',
        priority: 'high'
      });
    }

    // Add daily summary notification
    if (todayCount && todayCount > 0) {
      notifications.push({
        id: 'daily-summary',
        type: 'daily_summary',
        title: 'Daily Summary',
        message: `${todayCount} service requests received today`,
        time: 'Today',
        read: false,
        icon: '📊',
        priority: 'normal'
      });
    }

    // Add system notifications if no recent activity
    if (notifications.length === 0) {
      notifications.push({
        id: 'system-welcome',
        type: 'system',
        title: 'Welcome to TechFix Pro Admin',
        message: 'All systems are running smoothly. No new requests in the last 24 hours.',
        time: 'Just now',
        read: false,
        icon: '✅',
        priority: 'low'
      });
    }

    // Sort notifications by priority and time
    notifications.sort((a, b) => {
      const priorityOrder: { [key: string]: number } = { high: 3, normal: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return 0;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      totalCount: notifications.length,
      stats: {
        todayRequests: todayCount || 0,
        pendingRequests: pendingCount || 0,
        recentRequests: recentContacts?.length || 0
      }
    });

  } catch (error) {
    console.error('Notifications API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;
    
    // Get admin ID from request
    // For now, we'll use a placeholder admin ID for testing
    const adminId = '00000000-0000-0000-0000-000000000000'; // Placeholder admin ID for testing
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ 
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('recipient_type', 'admin')
      .eq('recipient_id', adminId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      notificationId
    });

  } catch (error) {
    console.error('Mark notification read API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;
    
    // Get admin ID from request
    // For now, we'll use a placeholder admin ID for testing
    const adminId = '00000000-0000-0000-0000-000000000000'; // Placeholder admin ID for testing
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_type', 'admin')
      .eq('recipient_id', adminId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Notification removed',
      notificationId
    });

  } catch (error) {
    console.error('Delete notification API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
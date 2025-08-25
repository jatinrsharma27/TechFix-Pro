# TechFix Pro Notification System

## Overview
A comprehensive notification system that provides real-time status updates for service requests across all user types (admin, employee, user). Once a notification is removed, it will not show again in any panel.

## Database Schema
The system uses a single `notifications` table with the following structure:

```sql
create table public.notifications (
  id uuid not null default gen_random_uuid (),
  recipient_type text not null, -- 'admin', 'employee', 'user'
  recipient_id uuid not null,   -- ID of the recipient
  request_id uuid null,         -- Related service request ID
  type text not null,           -- Notification type
  title text not null,          -- Notification title
  message text not null,        -- Notification message
  priority text not null default 'normal'::text, -- 'low', 'normal', 'high'
  read boolean not null default false,
  created_at timestamp with time zone not null default now(),
  read_at timestamp with time zone null,
  constraint notifications_pkey primary key (id)
);
```

## Components

### 1. NotificationBell Component
A compact notification bell for navigation bars with dropdown.

```tsx
import NotificationBell from '@/components/NotificationBell';

<NotificationBell userType="admin" userId={adminId} />
```

### 2. NotificationPanel Component
A full-featured notification management panel.

```tsx
import NotificationPanel from '@/components/NotificationPanel';

<NotificationPanel userType="user" userId={userId} />
```

### 3. useNotifications Hook
React hook for managing notifications state.

```tsx
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications('admin', adminId);
```

## API Endpoints

### Main Notifications API (`/api/notifications`)
- `GET` - Fetch notifications for a user
- `POST` - Create a new notification
- `PATCH` - Mark notification as read
- `DELETE` - Remove notification (permanent)

### User-specific APIs
- `/api/admin/notifications` - Admin notifications
- `/api/employee/notifications` - Employee notifications  
- `/api/user/notifications` - User notifications

## Notification Types

### Supported Types
- `new_request` - New service request submitted
- `pending_requests` - Requests awaiting action
- `daily_summary` - Daily activity summary
- `request_created` - Request creation confirmation
- `status_update` - Request status changes
- `engineer_assigned` - Engineer assignment
- `request_completed` - Request completion
- `system` - System announcements

### Priority Levels
- `low` - General information
- `normal` - Standard updates (default)
- `high` - Important notifications requiring attention

## Usage Examples

### Creating Notifications
```typescript
import { sendNotification } from '@/lib/notifications';

await sendNotification({
  recipient_type: 'user',
  recipient_id: userId,
  request_id: requestId,
  type: 'status_update',
  title: 'Request Status Updated',
  message: 'Your laptop repair status changed to "in progress"',
  priority: 'normal'
});
```

### Status Update Notifications
```typescript
import { sendStatusUpdateNotifications } from '@/utils/statusNotifications';

await sendStatusUpdateNotifications({
  requestId,
  userId,
  employeeId,
  adminId,
  oldStatus: 'pending',
  newStatus: 'in_progress',
  customerName: 'John Doe',
  serviceType: 'Laptop Repair'
});
```

### Engineer Assignment Notifications
```typescript
import { sendEngineerAssignedNotification } from '@/utils/statusNotifications';

await sendEngineerAssignedNotification({
  requestId,
  userId,
  employeeId,
  customerName: 'John Doe',
  employeeName: 'Jane Smith',
  serviceType: 'Smartphone Repair'
});
```

## Pages

### Notification Pages
- `/admin/notifications` - Admin notification management
- `/employee/notifications` - Employee notification management
- `/user/notifications` - User notification management

## Testing

### Create Test Notifications
```bash
POST /api/test-notifications
{
  "userType": "admin",
  "userId": "admin-uuid"
}
```

## Features

### Core Features
- ✅ Real-time notification fetching (30-second intervals)
- ✅ Mark as read functionality
- ✅ Permanent notification removal
- ✅ Priority-based styling
- ✅ Type-based icons
- ✅ Responsive design
- ✅ Auto-refresh on page visibility

### Notification Management
- ✅ Filter by read/unread status
- ✅ Visual priority indicators
- ✅ Time-based formatting (just now, 5m ago, etc.)
- ✅ Hover actions for removal
- ✅ Click to mark as read

### Integration Points
- ✅ Admin navbar integration
- ✅ Request status updates
- ✅ Engineer assignments
- ✅ Request completions
- ✅ System announcements

## Implementation Notes

### Key Benefits
1. **Unified System**: Single table for all notification types
2. **Permanent Removal**: Deleted notifications never reappear
3. **Real-time Updates**: Automatic polling and visibility-based refresh
4. **Type Safety**: TypeScript interfaces for all components
5. **Responsive Design**: Works on all screen sizes
6. **Priority System**: Visual indicators for importance levels

### Performance Considerations
- Notifications are limited to 50 per query
- Automatic cleanup of old notifications recommended
- Indexed queries for fast retrieval
- Minimal API calls with efficient state management

### Security
- User-specific filtering prevents cross-user data access
- Proper authentication required for all endpoints
- Input validation on all API routes
# TechFix Pro Email Notification Setup

## 📧 Email System Overview

The email notification system automatically sends emails to users, admins, and employees based on the request workflow without storing any email data in the database.

## 🔧 Setup Instructions

### 1. Email Configuration

Update your `.env.local` file with email credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@techfixpro.com
```

### 2. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### 3. Alternative Email Services

For other email services, update the transporter configuration in `src/lib/emailService.ts`:

```typescript
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 📋 Email Workflow

### 1. User Creates Request
- ✅ **User**: Confirmation email
- ✅ **Admin**: New request notification

### 2. Admin Actions
- **Cancel Request**: ✅ User gets cancellation email
- **Assign Employee**: ✅ Employee + User get assignment emails

### 3. Employee Actions
- **Accept**: ✅ Admin + User get acceptance emails
- **Reject**: ✅ Admin gets rejection email
- **Start Work**: ✅ Admin + User get work started emails
- **Complete**: ✅ Admin + User get completion emails
- **Cancel Work**: ✅ Admin gets cancellation email
- **Mark Pending**: ✅ Admin gets pending issue email

### 4. Admin Reassignment
- **After Rejection**: ✅ New Employee + User get reassignment emails

## 🎯 Integration

### Admin Dashboard
```tsx
import AdminRequestActions from '@/components/AdminRequestActions';

<AdminRequestActions 
  requestId={request.id}
  currentStatus={request.status}
  onStatusUpdate={fetchRequests}
/>
```

### Employee Dashboard
```tsx
import EmployeeRequestActions from '@/components/EmployeeRequestActions';

<EmployeeRequestActions 
  requestId={request.id}
  currentStatus={request.status}
  onStatusUpdate={fetchRequests}
/>
```

## 🔍 Testing

1. Create a test request as a user
2. Check both user and admin receive emails
3. Test all workflow actions
4. Verify emails are sent to correct recipients

## 🚨 Error Handling

- Email failures don't break the main workflow
- Errors are logged but don't prevent status updates
- Users still see success messages even if emails fail

## 📝 Email Templates

All email templates are in `src/lib/emailService.ts` and can be customized:
- Professional HTML formatting
- Dynamic content based on request data
- Consistent branding

## 🔒 Security

- No email data stored in database
- Credentials secured in environment variables
- Email sending happens server-side only
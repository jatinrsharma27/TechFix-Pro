# Employee Request Workflow

## Database Tables
- `contacts` - Main request table with status
- `employee_requests` - Assignment tracking table

## Status Flow

### 1. Admin Assigns Request
- Admin selects employee and assigns request
- `contacts.status` = "pending-confirmation"
- `contacts.assigned_to` = employee_id
- `employee_requests` record created with status "pending-confirmation"

### 2. Employee Views Request
- Employee sees request in "Pending Confirmation" status
- Can Accept or Reject

### 3. Employee Accepts
- `contacts.status` = "assigned"
- `employee_requests.status` = "assigned" (UPDATES existing record)
- Employee can now see "Start Work" button

### 4. Employee Starts Work
- `contacts.status` = "in-progress"
- `employee_requests.status` = "in-progress" (UPDATES existing record)
- Employee can now Complete or Cancel

### 5. Employee Completes
- `contacts.status` = "completed"
- `employee_requests.status` = "completed" (UPDATES existing record)

## Key Fix
- No duplicate records in employee_requests
- Always UPDATE existing record, never INSERT new ones
- Single source of truth for each request assignment

## Notifications
- Sent to user, admin, and employee on every status change
- Uses proper field mapping (user_id, employee_id, admin_id)
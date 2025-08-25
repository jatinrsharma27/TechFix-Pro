import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Employee OTP email template
function createEmployeeOTPEmailTemplate(otp: string, employeeName?: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee OTP Verification - TechFix Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-align: center;
            padding: 40px 30px;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .content {
            padding: 50px 40px;
            text-align: center;
        }
        
        .greeting {
            font-size: 24px;
            color: #2d3748;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 40px;
            line-height: 1.7;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border: 2px dashed #6ee7b7;
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
            display: inline-block;
        }
        
        .otp-label {
            font-size: 14px;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #10b981;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 20px 30px;
            border-radius: 8px;
            border: 2px solid #6ee7b7;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .otp-validity {
            font-size: 14px;
            color: #10b981;
            font-weight: 500;
        }
        
        .employee-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
            margin-bottom: 20px;
        }
        
        .security-note {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
            text-align: left;
        }
        
        .security-title {
            font-size: 16px;
            font-weight: 600;
            color: #059669;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-text {
            font-size: 14px;
            color: #065f46;
            line-height: 1.6;
        }
        
        .footer {
            background-color: #f7fafc;
            text-align: center;
            padding: 30px;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-bottom: 15px;
        }
        
        .company-info {
            font-size: 12px;
            color: #a0aec0;
        }
        
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
                margin: 0;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
                padding: 15px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🔧 TechFix Pro</div>
            <div class="tagline">Employee Portal Access</div>
        </div>
        
        <div class="content">
            <div class="employee-badge">👷 Employee Access</div>
            <h1 class="greeting">Hello${employeeName ? ` ${employeeName}` : ' Employee'}! 👋</h1>
            
            <p class="message">
                We received a request to access the TechFix Pro Employee Portal. Use the OTP code below to complete your authentication and access your dashboard.
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Employee Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏰ Valid for 5 minutes</div>
            </div>
            
            <div class="security-note">
                <div class="security-title">
                    🔒 Employee Security Notice
                </div>
                <div class="security-text">
                    • This OTP grants access to your employee dashboard<br>
                    • Never share this code with anyone<br>
                    • If you didn't request this access, contact IT support immediately<br>
                    • All activities are logged for security purposes
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Employee Support: <strong>employee@techfixpro.com</strong> | IT Support: <strong>support@techfixpro.com</strong>
            </div>
            
            <div class="company-info">
                © 2024 TechFix Pro - Employee Portal<br>
                This is a secure employee message. Do not forward or share.
            </div>
        </div>
    </div>
</body>
</html>
  `
}

// Enhanced sendMail function for employee emails
export async function sendEmployeeMail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"TechFix Pro Employee" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
  return info
}

// Specific function for sending employee OTP emails
export async function sendEmployeeOTPEmail(to: string, otp: string, employeeName?: string) {
  const subject = '🔐 TechFix Pro Employee Portal - Verification Code'
  const html = createEmployeeOTPEmailTemplate(otp, employeeName)
  
  return await sendEmployeeMail(to, subject, html)
}

// Employee welcome email template
function createEmployeeWelcomeEmailTemplate(employeeName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TechFix Pro Employee Portal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-align: center; padding: 40px 30px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px; text-align: center; }
        .welcome-title { font-size: 28px; color: #1f2937; margin-bottom: 20px; font-weight: 700; }
        .message { font-size: 16px; color: #4b5563; line-height: 1.7; margin-bottom: 30px; }
        .badge { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; border-radius: 25px; font-weight: 600; display: inline-block; margin: 20px 0; }
        .features { background: #ecfdf5; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: left; }
        .feature { display: flex; align-items: center; margin-bottom: 15px; font-size: 14px; color: #374151; }
        .footer { background: #f7fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉 TechFix Pro</div>
            <div>Employee Portal</div>
        </div>
        <div class="content">
            <h1 class="welcome-title">Congratulations, ${employeeName}! 🎊</h1>
            <div class="badge">✅ Employee Account Activated</div>
            <p class="message">
                Welcome to the TechFix Pro Employee Portal! Your employee account has been successfully created and verified. You now have access to manage service requests assigned to you.
            </p>
            <div class="features">
                <div class="feature">📋 View and manage assigned service requests</div>
                <div class="feature">📊 Track your performance and completed work</div>
                <div class="feature">📅 Access your work schedule and assignments</div>
                <div class="feature">💬 Communicate with customers and admins</div>
                <div class="feature">💰 View your payment information and history</div>
            </div>
            <p class="message">
                You can now sign in to your employee account and start managing your assigned service requests. If you need any assistance, our support team is here to help.
            </p>
        </div>
        <div class="footer">
            <strong>TechFix Pro Employee Team</strong><br>
            employee@techfixpro.com | © 2024 TechFix Pro
        </div>
    </div>
</body>
</html>
  `
}

// Function to send employee welcome email
export async function sendEmployeeWelcomeEmail(to: string, employeeName: string) {
  const subject = '🎉 Welcome to TechFix Pro Employee Portal - Account Activated!'
  const html = createEmployeeWelcomeEmailTemplate(employeeName)
  
  return await sendEmployeeMail(to, subject, html)
}
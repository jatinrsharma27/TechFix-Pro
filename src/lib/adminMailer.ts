import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Admin OTP email template
function createAdminOTPEmailTemplate(otp: string, adminName?: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin OTP Verification - TechFix Pro</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px dashed #fca5a5;
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
            display: inline-block;
        }
        
        .otp-label {
            font-size: 14px;
            color: #991b1b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 20px 30px;
            border-radius: 8px;
            border: 2px solid #fca5a5;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .otp-validity {
            font-size: 14px;
            color: #dc2626;
            font-weight: 500;
        }
        
        .admin-badge {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
            text-align: left;
        }
        
        .security-title {
            font-size: 16px;
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-text {
            font-size: 14px;
            color: #7f1d1d;
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
            <div class="tagline">Admin Portal Access</div>
        </div>
        
        <div class="content">
            <div class="admin-badge">🛡️ Admin Access</div>
            <h1 class="greeting">Hello${adminName ? ` ${adminName}` : ' Admin'}! 👋</h1>
            
            <p class="message">
                We received a request to access the TechFix Pro Admin Portal. Use the OTP code below to complete your authentication and access the administrative dashboard.
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Admin Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏰ Valid for 5 minutes</div>
            </div>
            
            <div class="security-note">
                <div class="security-title">
                    🔒 Admin Security Notice
                </div>
                <div class="security-text">
                    • This OTP grants access to sensitive administrative functions<br>
                    • Never share this code with anyone, including other staff members<br>
                    • If you didn't request this access, contact IT security immediately<br>
                    • All admin activities are logged and monitored
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Admin Support: <strong>admin@techfixpro.com</strong> | IT Security: <strong>security@techfixpro.com</strong>
            </div>
            
            <div class="company-info">
                © 2024 TechFix Pro - Admin Portal<br>
                This is a secure administrative message. Do not forward or share.
            </div>
        </div>
    </div>
</body>
</html>
  `
}

// Enhanced sendMail function for admin emails
export async function sendAdminMail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"TechFix Pro Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
  return info
}

// Specific function for sending admin OTP emails
export async function sendAdminOTPEmail(to: string, otp: string, adminName?: string) {
  const subject = '🔐 TechFix Pro Admin Portal - Verification Code'
  const html = createAdminOTPEmailTemplate(otp, adminName)
  
  return await sendAdminMail(to, subject, html)
}

// Admin welcome email template
function createAdminWelcomeEmailTemplate(adminName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TechFix Pro Admin Portal</title>
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
        .features { background: #f0fdf4; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: left; }
        .feature { display: flex; align-items: center; margin-bottom: 15px; font-size: 14px; color: #374151; }
        .footer { background: #f7fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉 TechFix Pro</div>
            <div>Admin Portal</div>
        </div>
        <div class="content">
            <h1 class="welcome-title">Congratulations, ${adminName}! 🎊</h1>
            <div class="badge">✅ Admin Account Activated</div>
            <p class="message">
                Welcome to the TechFix Pro Admin Portal! Your administrator account has been successfully created and verified. You now have full access to manage the platform.
            </p>
            <div class="features">
                <div class="feature">🎛️ Full dashboard access with real-time analytics</div>
                <div class="feature">👥 User and engineer management capabilities</div>
                <div class="feature">📋 Service request monitoring and assignment</div>
                <div class="feature">📊 Comprehensive reporting and insights</div>
                <div class="feature">⚙️ System configuration and settings control</div>
            </div>
            <p class="message">
                You can now sign in to your admin account and start managing the TechFix Pro platform. If you need any assistance, our support team is here to help.
            </p>
        </div>
        <div class="footer">
            <strong>TechFix Pro Admin Team</strong><br>
            admin@techfixpro.com | © 2024 TechFix Pro
        </div>
    </div>
</body>
</html>
  `
}

// Function to send admin welcome email
export async function sendAdminWelcomeEmail(to: string, adminName: string) {
  const subject = '🎉 Welcome to TechFix Pro Admin Portal - Account Activated!'
  const html = createAdminWelcomeEmailTemplate(adminName)
  
  return await sendAdminMail(to, subject, html)
}
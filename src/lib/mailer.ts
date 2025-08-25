import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Professional OTP email template
function createOTPEmailTemplate(otp: string, userName?: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - TechFix Pro</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px dashed #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            margin: 40px 0;
            display: inline-block;
        }
        
        .otp-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 20px 30px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .otp-validity {
            font-size: 14px;
            color: #e53e3e;
            font-weight: 500;
        }
        
        .security-note {
            background-color: #fef5e7;
            border-left: 4px solid #f6ad55;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
            text-align: left;
        }
        
        .security-title {
            font-size: 16px;
            font-weight: 600;
            color: #c05621;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-text {
            font-size: 14px;
            color: #744210;
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
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            padding: 8px 12px;
            background-color: #e2e8f0;
            border-radius: 6px;
            text-decoration: none;
            color: #4a5568;
            font-size: 12px;
            transition: background-color 0.3s ease;
        }
        
        .social-link:hover {
            background-color: #cbd5e0;
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
            <div class="tagline">Your Trusted Tech Solution Partner</div>
        </div>
        
        <div class="content">
            <h1 class="greeting">Hello${userName ? ` ${userName}` : ''}! 👋</h1>
            
            <p class="message">
                We received a request to verify your account. Use the OTP code below to complete your verification process and secure your TechFix Pro account.
            </p>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏰ Valid for 10 minutes</div>
            </div>
            
            <div class="security-note">
                <div class="security-title">
                    🛡️ Security Notice
                </div>
                <div class="security-text">
                    • Never share this OTP with anyone<br>
                    • TechFix Pro will never ask for your OTP via phone or email<br>
                    • If you didn't request this code, please ignore this email
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Need help? Contact our support team at <strong>support@techfixpro.com</strong>
            </div>
            
            <div class="social-links">
                <a href="#" class="social-link">📞 Support</a>
                <a href="#" class="social-link">🌐 Website</a>
                <a href="#" class="social-link">💬 Chat</a>
            </div>
            
            <div class="company-info">
                © 2024 TechFix Pro. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
  `
}

// Enhanced sendMail function with OTP template
export async function sendMail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
  return info
}

// Specific function for sending OTP emails
export async function sendOTPEmail(to: string, otp: string, userName?: string) {
  const subject = '🔐 Your TechFix Pro Verification Code'
  const html = createOTPEmailTemplate(otp, userName)
  
  return await sendMail(to, subject, html)
}

// User welcome email template
function createUserWelcomeEmailTemplate(userName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TechFix Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px 30px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px; text-align: center; }
        .welcome-title { font-size: 28px; color: #1f2937; margin-bottom: 20px; font-weight: 700; }
        .message { font-size: 16px; color: #4b5563; line-height: 1.7; margin-bottom: 30px; }
        .badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 25px; font-weight: 600; display: inline-block; margin: 20px 0; }
        .services { background: #f0f4ff; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: left; }
        .service { display: flex; align-items: center; margin-bottom: 15px; font-size: 14px; color: #374151; }
        .footer { background: #f7fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉 TechFix Pro</div>
            <div>Your Tech Solution Partner</div>
        </div>
        <div class="content">
            <h1 class="welcome-title">Welcome, ${userName}! 🚀</h1>
            <div class="badge">✅ Account Successfully Created</div>
            <p class="message">
                Congratulations! Your TechFix Pro account has been successfully created and verified. You're now ready to access our comprehensive tech repair and support services.
            </p>
            <div class="services">
                <div class="service">🔧 Expert device repair services</div>
                <div class="service">💻 Computer and laptop troubleshooting</div>
                <div class="service">📱 Mobile device support and repair</div>
                <div class="service">🏠 On-site and remote assistance</div>
                <div class="service">⚡ Fast and reliable service delivery</div>
                <div class="service">🛡️ Warranty protection on all repairs</div>
            </div>
            <p class="message">
                Ready to get started? You can now request services, track your repairs, and manage your account through our platform. Our expert technicians are here to help!
            </p>
        </div>
        <div class="footer">
            <strong>TechFix Pro Team</strong><br>
            support@techfixpro.com | © 2024 TechFix Pro
        </div>
    </div>
</body>
</html>
  `
}

// Function to send user welcome email
export async function sendUserWelcomeEmail(to: string, userName: string) {
  const subject = '🎉 Welcome to TechFix Pro - Account Created Successfully!'
  const html = createUserWelcomeEmailTemplate(userName)
  
  return await sendMail(to, subject, html)
}
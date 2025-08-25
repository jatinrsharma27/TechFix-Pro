'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import Toast, { useToast } from '../../Component/Toast';

export default function OTPVerificationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') || 'user@example.com';
  const purpose = params.get('purpose') || 'verification';
  const full_name = params.get('full_name') || '';
  const signupPassword = params.get('password') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestBody: any = {
        action: 'verify-otp',
        email,
        otp: otpCode,
        purpose
      };
      
      // Add full_name for signup verification
      if (purpose === 'signup') {
        requestBody.full_name = full_name;
      }
      
      const res = await fetch('/api/employee/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message || 'OTP verified successfully!', 'success');
        
        setTimeout(() => {
          if (purpose === 'reset') {
            router.push(`/employee/Auth/set-password?email=${encodeURIComponent(email)}`);
          } else if (purpose === 'signup' && data.user) {
            // For signup, set user data and redirect to dashboard
            localStorage.setItem('employee', JSON.stringify(data.user));
            localStorage.setItem('employee_session_token', `employee_${data.user.id}_${Date.now()}`);
            router.push('/employee/dashboard');
          } else if (purpose === 'signin' && data.user) {
            // For signin, set user data and redirect to dashboard
            localStorage.setItem('employee', JSON.stringify(data.user));
            localStorage.setItem('employee_session_token', `employee_${data.user.id}_${Date.now()}`);
            router.push('/employee/dashboard');
          } else {
            // Default redirect to dashboard
            router.push('/employee/dashboard');
          }
        }, 1000);
      } else {
        showToast(data.error || 'Verification failed', 'error');
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      showToast('An error occurred. Please try again.', 'error');
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    
    try {
      const requestBody: any = { 
        email: email, 
        purpose: purpose
      };
      
      // Add additional data for signup purpose
      if (purpose === 'signup') {
        requestBody.full_name = full_name;
        requestBody.password = signupPassword;
      }
      
      const res = await fetch('/api/employee/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', ...requestBody }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast('New OTP code has been sent to your email', 'success');
      } else {
        showToast(data.error || 'Failed to resend OTP', 'error');
        setResendCooldown(0);
      }
    } catch (error) {
      console.error('Resend error:', error);
      showToast('Failed to resend OTP. Please try again.', 'error');
      setResendCooldown(0);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full uppercase tracking-wide">
              Employee Portal
            </span>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Verification</h1>
          <p className="text-gray-600">
            We have sent a 6-digit verification code to your employee email
          </p>
          <p className="text-green-600 font-medium">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex justify-center space-x-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                  digit 
                    ? 'border-blue-500 bg-blue-50 text-blue-900' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                } ${error ? 'border-red-300' : ''}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}
        </div>



        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isOtpComplete || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isOtpComplete && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify Code'
          )}
        </button>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-3">
            Did not receive the code?
          </p>
          {resendCooldown > 0 ? (
            <p className="text-blue-600 text-sm">
              Resend code in {resendCooldown} seconds
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <button onClick={() => window.history.back()} className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 text-sm font-medium mb-1">
                Check your email
              </p>
              <p className="text-blue-700 text-xs">
                The verification code might take a few minutes to arrive. 
                Please also check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
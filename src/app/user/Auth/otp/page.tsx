'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

export default function OTPVerificationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') || 'user@example.com';
  const purpose = params.get('purpose') || 'verification';
  const full_name = params.get('full_name') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      const body: any = { action: 'verify-otp', email, otp: otpCode, purpose };
      if (full_name) body.full_name = full_name;

      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message || 'OTP verified successfully!');
        
        if (purpose === 'reset') {
          // Redirect to set password page for reset
          router.push(`/user/Auth/set-password?email=${encodeURIComponent(email)}`);
        } else {
          // Create Supabase session for authentication
          if ((purpose === 'signup' || purpose === 'signin') && data.user) {
            // Store user data in localStorage for authentication
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/');
          } else {
            router.push('/');
          }
        }
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (purpose === 'signin') {
      alert('For security reasons, please go back and sign in again to resend OTP.');
      router.back();
      return;
    }
    
    setResendCooldown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    
    try {
      const requestBody: any = { 
        action: 'send-otp',
        email: email, 
        purpose: purpose
      };

      // For signup, include password if available from URL params
      if (purpose === 'signup') {
        const urlPassword = params.get('password');
        if (urlPassword) {
          requestBody.password = urlPassword;
        }
      }

      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('New OTP code has been sent to your email');
      } else {
        alert(data.error || 'Failed to resend OTP');
        setResendCooldown(0); // Reset cooldown on error
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend OTP. Please try again.');
      setResendCooldown(0); // Reset cooldown on error
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We have sent a 6-digit verification code to your mail
          </p>
          <p className="text-blue-600 font-medium">{email}</p>
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
    </div>
  );
}
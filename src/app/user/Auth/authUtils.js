// Frontend Auth Utilities

export const authAPI = {
  // Send OTP for signup, signin, or reset
  sendOTP: async (email, purpose, password = null) => {
    const body = { email, purpose };
    if (password) body.password = password;

    const res = await fetch('/api/user/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    return { res, data: await res.json() };
  },

  // Verify OTP
  verifyOTP: async (email, otp, purpose, full_name = null) => {
    const body = { email, otp, purpose };
    if (full_name) body.full_name = full_name;

    const res = await fetch('/api/user/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    return { res, data: await res.json() };
  },

  // Set new password
  setPassword: async (email, password) => {
    const res = await fetch('/api/user/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-password', email, password }),
    });
    
    return { res, data: await res.json() };
  }
};

// Form validation utilities
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isValid: password.length >= 8 && 
             /[a-z]/.test(password) && 
             /[A-Z]/.test(password) && 
             /\d/.test(password) && 
             /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

// Local storage utilities
export const authStorage = {
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};
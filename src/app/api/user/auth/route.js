import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendOTPEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { action, ...data } = await req.json();

  switch (action) {
    case 'send-otp':
      return await handleSendOTP(data);
    case 'verify-otp':
      return await handleVerifyOTP(data);
    case 'set-password':
      return await handleSetPassword(data);
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

async function handleSendOTP({ email, purpose, password }) {
  // For signin, verify user credentials first
  if (purpose === 'signin') {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a real password (not temp)
    if (user.password === 'TEMP_PASSWORD_TO_BE_REPLACED') {
      return NextResponse.json({ error: 'Please complete signup first' }, { status: 400 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  }

  // For signup, check if user already exists with real password
  if (purpose === 'signup') {
    const { data: existingUser } = await supabase
      .from('users')
      .select('password')
      .eq('email', email)
      .single();

    if (existingUser && existingUser.password !== 'TEMP_PASSWORD_TO_BE_REPLACED') {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP to users table
  let error;
  if (purpose === 'signup') {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { error: upsertError } = await supabase.from("users").upsert({
      email,
      password: hashedPassword,
      otp,
      otp_purpose: purpose,
      otp_expires_at: otpExpiresAt,
    }, { onConflict: 'email', ignoreDuplicates: false });
    error = upsertError;
  } else {
    const { error: updateError } = await supabase.from("users").update({
      otp,
      otp_purpose: purpose,
      otp_expires_at: otpExpiresAt,
    }).eq('email', email);
    error = updateError;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendOTPEmail(email, otp);

  return NextResponse.json({ message: "OTP sent successfully" });
}

async function handleVerifyOTP({ email, otp, purpose, full_name }) {
  const { data: userData, error: otpError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .eq("otp_purpose", purpose)
    .gt("otp_expires_at", new Date().toISOString())
    .single();

  if (otpError || !userData) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  // Clear OTP fields after successful verification
  const clearOTP = async () => {
    await supabase.from("users").update({
      otp: null,
      otp_purpose: null,
      otp_expires_at: null
    }).eq("email", email);
  };

  if (purpose === "signup") {
    const { error: userError } = await supabase.from("users").update({
      full_name,
    }).eq("email", email);

    if (userError) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
    await clearOTP();
    return NextResponse.json({
      message: "Account created successfully!",
      user: { ...userData, full_name }
    });
  }

  if (purpose === "signin") {
    await clearOTP();
    // Create Supabase session
    return NextResponse.json({
      message: "Signed in successfully!",
      user: userData
    });
  }

  if (purpose === "reset") {
    await clearOTP();
    return NextResponse.json({ message: "OTP verified! Please set your new password." });
  }

  return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
}

async function handleSetPassword({ email, password }) {
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and get user data
    const { data: userData, error } = await supabase
      .from("users")
      .update({ 
        password: hashedPassword, 
        updated_at: new Date().toISOString() 
      })
      .eq("email", email)
      .select('full_name, email')
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Password updated successfully!",
      user: userData
    });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
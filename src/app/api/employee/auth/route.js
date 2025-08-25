import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
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
  // For signin, verify employee credentials first
  if (purpose === 'signin') {
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: 'Employee not found or inactive' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, employee.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save OTP to employees table
  const { error } = await supabase.from("employees").update({
    otp,
    otp_purpose: purpose,
    otp_expires_at: otpExpiresAt,
  }).eq('email', email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendOTPEmail(email, otp);

  return NextResponse.json({ message: "OTP sent successfully" });
}

async function handleVerifyOTP({ email, otp, purpose }) {
  const { data: employeeData, error: otpError } = await supabase
    .from("employees")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .eq("otp_purpose", purpose)
    .eq("is_active", true)
    .gt("otp_expires_at", new Date().toISOString())
    .single();

  if (otpError || !employeeData) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  // Clear OTP fields and update last_login
  await supabase.from("employees").update({
    otp: null,
    otp_purpose: null,
    otp_expires_at: null,
    last_login: new Date().toISOString()
  }).eq("email", email);

  if (purpose === "signin") {
    return NextResponse.json({
      message: "Signed in successfully!",
      user: employeeData
    });
  }

  if (purpose === "reset") {
    return NextResponse.json({ message: "OTP verified! Please set your new password." });
  }

  return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
}

async function handleSetPassword({ email, password }) {
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: employeeData, error } = await supabase
      .from("employees")
      .update({ 
        password_hash: hashedPassword, 
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
      user: employeeData
    });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
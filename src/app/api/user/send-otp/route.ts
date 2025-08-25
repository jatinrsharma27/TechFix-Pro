import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendOTPEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, purpose, password } = await req.json();

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
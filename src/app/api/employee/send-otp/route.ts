import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendAdminOTPEmail } from "@/lib/adminMailer";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, purpose, password, full_name } = await req.json();
  let adminName = full_name;

  // For signin, verify admin credentials first
  if (purpose === 'signin') {
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    adminName = admin.full_name;
  }

  // For signup, check if admin already exists
  if (purpose === 'signup') {
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 409 });
    }

    // Create temporary admin record for OTP verification
    const hashedPassword = await bcrypt.hash(password, 12);
    const { error: createError } = await supabase
      .from('admins')
      .insert({
        email,
        full_name,
        password_hash: hashedPassword,
        is_active: false, // Will be activated after OTP verification
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createError) {
      return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
    }
  }

  // For reset, verify admin exists
  if (purpose === 'reset') {
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    adminName = admin.full_name;
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to admin table with expiry (5 minutes)
  const { error } = await supabase.from("admins").update({
    otp,
    otp_purpose: purpose,
    otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
    updated_at: new Date().toISOString()
  }).eq('email', email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send OTP via email using admin template
  await sendAdminOTPEmail(email, otp, adminName);

  return NextResponse.json({ message: "OTP sent successfully" });
}

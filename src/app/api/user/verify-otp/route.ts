import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendUserWelcomeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email, otp, purpose, full_name } = await req.json();

  // Verify OTP
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

  // Clear used OTP
  const clearOTP = async () => {
    await supabase.from("users").update({ 
      otp: null, 
      otp_purpose: null, 
      otp_expires_at: null 
    }).eq("email", email);
  };

  if (purpose === "signup") {
    // For signup, the password was already stored during send-otp, just update full_name
    const { error: userError } = await supabase.from("users").update({
      full_name,
    }).eq("email", email);

    if (userError) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    await clearOTP();

    // Send welcome email
    try {
      await sendUserWelcomeEmail(email, full_name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return NextResponse.json({ 
      message: "Account created successfully!",
      user: { ...userData, full_name }
    });
  }

  if (purpose === "signin") {
    await clearOTP();
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
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendAdminWelcomeEmail } from "@/lib/adminMailer";

export async function POST(req: Request) {
  const { email, otp, purpose } = await req.json();

  // Verify OTP
  const { data: adminData, error: otpError } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .eq("otp_purpose", purpose)
    .gt("otp_expires_at", new Date().toISOString())
    .single();

  if (otpError || !adminData) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  // Clear used OTP
  const clearOTP = async () => {
    await supabase.from("admins").update({ 
      otp: null, 
      otp_purpose: null, 
      otp_expires_at: null,
      updated_at: new Date().toISOString()
    }).eq("email", email);
  };

  if (purpose === "signin") {
    // Update last login
    await supabase.from("admins").update({
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("email", email);

    await clearOTP();
    return NextResponse.json({ 
      message: "Signed in successfully!",
      admin: {
        id: adminData.id,
        full_name: adminData.full_name,
        email: adminData.email
      }
    });
  }

  if (purpose === "signup") {
    // Activate admin account after successful OTP verification
    await supabase.from("admins").update({
      is_active: true,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq("email", email);

    await clearOTP();

    // Send welcome email
    try {
      await sendAdminWelcomeEmail(email, adminData.full_name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return NextResponse.json({ 
      message: "Account created and verified successfully!",
      admin: {
        id: adminData.id,
        full_name: adminData.full_name,
        email: adminData.email
      }
    });
  }

  if (purpose === "reset") {
    await clearOTP();
    return NextResponse.json({ message: "OTP verified! Please set your new password." });
  }

  return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
}
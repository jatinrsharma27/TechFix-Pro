import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update admin password
    const { data: admin, error } = await supabase
      .from('admin')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, full_name, email')
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Password updated successfully',
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
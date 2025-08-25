// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin')
      .select('id, email, password_hash, full_name, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!admin.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await supabase
      .from('admin')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', admin.id);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        is_active: admin.is_active
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    const { data: existingAdmin } = await supabase
      .from('admin')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: newAdmin, error: createError } = await supabase
      .from('admin')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        is_active: true
      })
      .select('id, email, full_name, is_active, created_at')
      .single();

    if (createError) {
      console.error('Create admin error:', createError);
      return NextResponse.json(
        { error: 'Failed to create admin account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      admin: newAdmin
    });

  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
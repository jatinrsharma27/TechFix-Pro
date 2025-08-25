import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, email, password_hash, full_name, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (employeeError || !employee) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!employee.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, employee.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    await supabase
      .from('employees')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', employee.id);

    const token = jwt.sign(
      { 
        id: employee.id, 
        email: employee.email, 
        role: 'employee' 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        id: employee.id,
        email: employee.email,
        full_name: employee.full_name,
        is_active: employee.is_active
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

    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: newEmployee, error: createError } = await supabase
      .from('employees')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        is_active: true
      })
      .select('id, email, full_name, is_active, created_at')
      .single();

    if (createError) {
      console.error('Create employee error:', createError);
      return NextResponse.json(
        { error: 'Failed to create employee account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee account created successfully',
      employee: newEmployee
    });

  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
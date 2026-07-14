import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('========================================');
    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email - only select columns that exist
    const [users] = await pool.query(
      `SELECT 
        id, 
        username, 
        full_name, 
        email, 
        password, 
        role, 
        is_active, 
        created_at, 
        last_login 
      FROM users 
      WHERE email = ?`,
      [email]
    );

    console.log('📊 Users found:', users.length);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (user.is_active === 0) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password matches:', isPasswordValid);
    } catch (compareError) {
      console.error('bcrypt compare error:', compareError);
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.full_name || user.username,
        role: user.role || 'staff'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Login successful for:', user.email);
    console.log('========================================');

    return response;
  } catch (error: any) {
    console.error('❌ Login Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });
    
    return NextResponse.json(
      { error: 'Failed to login: ' + error.message },
      { status: 500 }
    );
  }
}
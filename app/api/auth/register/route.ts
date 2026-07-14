import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // Get the auth token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, value] = c.split('=');
        return [key, value];
      })
    );

    const token = cookies.auth_token;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token and check admin role
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Admin is authorized, proceed with registration
    const { name, email, password, phone, address, role } = await request.json();

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users 
       (username, full_name, email, password, phone, address, role, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        email.split('@')[0],
        name,
        email,
        hashedPassword,
        phone || null,
        address || null,
        role || 'staff'
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    }, { status: 201 });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
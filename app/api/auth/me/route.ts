import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, value] = c.split('=');
        return [key, value];
      })
    );

    const token = cookies.auth_token;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Get user from database
    const [users] = await pool.query(
      `SELECT id, username, full_name, email, phone, address, role, is_active, created_at, last_login 
       FROM users 
       WHERE id = ? AND is_active = 1`,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(users[0]);
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
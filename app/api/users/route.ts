import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    // Verify admin access
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const [users] = await pool.query(
      `SELECT id, username, full_name, email, role, is_active, created_at, last_login 
       FROM users 
       ORDER BY id`
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
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

    const [users] = await pool.query(
      `SELECT 
        id, 
        username, 
        full_name, 
        email, 
        phone,
        bio,
        address, 
        role, 
        is_active, 
        created_at, 
        last_login 
      FROM users 
      WHERE id = ? AND is_active = 1`,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
      address: user.address,
      role: user.role || 'staff',
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login
    });
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
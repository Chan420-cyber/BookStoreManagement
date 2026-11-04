import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PUT(request: Request) {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.id;

    const body = await request.json();
    const { full_name, email, phone, bio } = body;

    console.log('📝 Updating profile:', { full_name, email, phone, bio });

    // Update user profile
    await pool.query(
      `UPDATE users 
       SET full_name = ?, 
           email = ?, 
           phone = ?, 
           bio = ?,
           updated_at = NOW() 
       WHERE id = ?`,
      [full_name.trim(), email.trim(), phone || null, bio || null, userId]
    );

    // Get updated user
    const [users] = await pool.query(
      `SELECT 
        id, 
        username, 
        full_name, 
        email, 
        phone, 
        bio,
        role, 
        is_active, 
        created_at, 
        last_login 
      FROM users 
      WHERE id = ?`,
      [userId]
    );

    const user = users[0];

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (error: any) {
    console.error('❌ Update Profile Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
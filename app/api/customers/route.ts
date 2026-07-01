import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [customers] = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.full_name as name,
        u.email,
        u.role,
        COUNT(s.id) as total_orders,
        COALESCE(SUM(s.final_amount), 0) as total_spent,
        MAX(s.sale_date) as last_purchase_date
      FROM users u
      LEFT JOIN sales s ON u.id = s.user_id
      WHERE u.is_active = 1
      GROUP BY u.id, u.username, u.full_name, u.email, u.role
      ORDER BY total_spent DESC
      LIMIT 50
    `);

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
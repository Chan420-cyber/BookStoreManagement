import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test connection
    const [result] = await pool.query('SELECT 1 as connected, NOW() as time');
    
    // Test categories table
    const [categories] = await pool.query('SELECT COUNT(*) as count FROM categories');
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!',
      connection: result[0],
      categoriesCount: categories[0].count,
      database: process.env.DB_NAME || 'bookstore_db'
    });
  } catch (error: any) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    }, { status: 500 });
  }
}
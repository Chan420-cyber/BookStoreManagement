import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [inventory] = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.stock_quantity,
        b.minimum_stock,
        CASE 
          WHEN b.stock_quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN b.stock_quantity <= b.minimum_stock THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END as status
      FROM books b
      WHERE b.is_active = 1
      ORDER BY 
        CASE 
          WHEN b.stock_quantity <= b.minimum_stock THEN 0 
          ELSE 1 
        END,
        b.stock_quantity ASC
    `);

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Inventory API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
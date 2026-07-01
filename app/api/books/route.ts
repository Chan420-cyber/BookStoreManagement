import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [books] = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.isbn,
        b.price,
        b.stock_quantity,
        b.minimum_stock,
        b.description,
        b.publisher,
        b.edition,
        b.publication_year,
        b.date_added,
        b.last_updated,
        b.category_id,
        c.name as category_name,
        CASE 
          WHEN b.stock_quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN b.stock_quantity BETWEEN 1 AND 5 THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END as status
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.is_active = 1
      ORDER BY b.id DESC
    `);

    return NextResponse.json(books);
  } catch (error) {
    console.error('Books API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, author, isbn, category_id, price, stock_quantity, 
      minimum_stock, description, publisher, edition, publication_year 
    } = body;

    // Check if ISBN already exists
    if (isbn) {
      const [existing] = await pool.query(
        'SELECT id FROM books WHERE isbn = ? AND is_active = 1',
        [isbn]
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Duplicate entry: A book with this ISBN already exists' },
          { status: 400 }
        );
      }
    }

    const [result] = await pool.query(
      `INSERT INTO books 
       (title, author, isbn, category_id, price, stock_quantity, 
        minimum_stock, description, publisher, edition, publication_year, 
        date_added, last_updated, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 1)`,
      [title, author, isbn || null, category_id || null, price, stock_quantity, 
       minimum_stock || 5, description || null, publisher || null, 
       edition || null, publication_year || null]
    );

    const [newBook] = await pool.query(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newBook[0], { status: 201 });
  } catch (error: any) {
    console.error('POST Books Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Duplicate entry: A book with this ISBN already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
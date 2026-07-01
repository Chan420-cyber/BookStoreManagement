import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all categories
export async function GET() {
  try {
    const [categories] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id AND b.is_active = 1
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST new category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Insert new category
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, created_at) VALUES (?, ?, NOW())',
      [name.trim(), description || null]
    );

    // Get the newly created category
    const [newCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('Categories POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
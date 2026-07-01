import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('GET Category ID:', id);

    const [categories] = await pool.query(
      `SELECT c.*, COUNT(b.id) as book_count 
       FROM categories c
       LEFT JOIN books b ON c.id = b.category_id AND b.is_active = 1
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('GET Category Error:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// UPDATE category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    console.log('PUT Category ID:', id);

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name
    const [duplicate] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name.trim(), id]
    );

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description || null, id]
    );

    const [updatedCategory] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error('PUT Category Error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('🔍 Attempting to delete category with ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const [existing] = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [id]
    );

    console.log('📦 Found category:', existing);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: `Category with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Check if category has books
    const [books] = await pool.query(
      'SELECT COUNT(*) as count FROM books WHERE category_id = ? AND is_active = 1',
      [id]
    );

    console.log('📚 Books in category:', books[0].count);

    if (books[0].count > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category "${existing[0].name}" because it has ${books[0].count} active book(s) assigned to it.`,
          bookCount: books[0].count
        },
        { status: 400 }
      );
    }

    // Delete the category
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    
    console.log('✅ Category deleted successfully:', existing[0].name);

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      category: existing[0]
    });
  } catch (error) {
    console.error('❌ DELETE Category Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
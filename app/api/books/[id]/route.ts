import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 16, params is a Promise
    const { id } = await params;
    
    console.log('🔍 DELETE - Book ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Check if the book exists and is active
    const [existing] = await pool.query(
      'SELECT id, title, is_active FROM books WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: `Book with ID ${id} not found` },
        { status: 404 }
      );
    }

    if (existing[0].is_active === 0) {
      return NextResponse.json(
        { error: 'Book is already deleted' },
        { status: 400 }
      );
    }

    // Soft delete
    await pool.query(
      'UPDATE books SET is_active = 0, last_updated = NOW() WHERE id = ?',
      [id]
    );

    console.log('✅ Book deleted:', existing[0].title);
    return NextResponse.json({ 
      message: 'Book deleted successfully',
      book: { id: existing[0].id, title: existing[0].title }
    });

  } catch (error: any) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔍 UPDATE - Book ID:', id);
    console.log('📝 Update data:', body);

    const { 
      title, author, isbn, category_id, price, stock_quantity, 
      minimum_stock, description, publisher, edition, publication_year 
    } = body;

    // Validate
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const [existing] = await pool.query(
      'SELECT id, title FROM books WHERE id = ? AND is_active = 1',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check ISBN duplicate
    if (isbn) {
      const [duplicate] = await pool.query(
        'SELECT id FROM books WHERE isbn = ? AND id != ? AND is_active = 1',
        [isbn, id]
      );
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: 'A book with this ISBN already exists' },
          { status: 400 }
        );
      }
    }

    // Update
    await pool.query(
      `UPDATE books SET 
        title = ?, author = ?, isbn = ?, category_id = ?, 
        price = ?, stock_quantity = ?, minimum_stock = ?, 
        description = ?, publisher = ?, edition = ?, 
        publication_year = ?, last_updated = NOW()
       WHERE id = ?`,
      [
        title, author, isbn || null, category_id || null,
        price, stock_quantity, minimum_stock || 5,
        description || null, publisher || null,
        edition || null, publication_year || null, id
      ]
    );

    const [updatedBook] = await pool.query(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = ?`,
      [id]
    );

    return NextResponse.json(updatedBook[0]);

  } catch (error: any) {
    console.error('❌ PUT Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'A book with this ISBN already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [books] = await pool.query(
      `SELECT b.*, c.name as category_name 
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.is_active = 1`,
      [id]
    );

    if (books.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json(books[0]);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user details
    const [users] = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.full_name as name,
        u.email,
        u.is_active,
        u.created_at,
        u.last_login,
        u.role
      FROM users u
      WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get order statistics
    const [orders] = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(final_amount), 0) as total_spent,
        MAX(sale_date) as last_purchase_date
       FROM sales 
       WHERE user_id = ?`,
      [id]
    );

    return NextResponse.json({
      id: user.id,
      name: user.name || user.username || 'Unknown',
      email: user.email || '',
      phone: '',
      address: '',
      total_orders: parseInt(orders[0]?.total_orders) || 0,
      total_spent: parseFloat(orders[0]?.total_spent) || 0,
      last_purchase_date: orders[0]?.last_purchase_date || null,
      created_at: user.created_at || null,
      status: user.is_active === 1 ? 'active' : 'inactive',
      role: user.role || 'staff'
    });
  } catch (error) {
    console.error('GET Customer Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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
    const { name, email, phone, address, password, role } = body;  // ← Add phone

    // Validate
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists for another customer
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim(), id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }

    // Build update query with phone
    let updateQuery = 'UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = NOW()';
    const queryParams: any[] = [name.trim(), email.trim(), phone || null];  // ← Add phone

    if (address !== undefined) {
      updateQuery += ', address = ?';
      queryParams.push(address || null);
    }

    if (password) {
      updateQuery += ', password = ?';
      queryParams.push(password);
    }

    if (role) {
      updateQuery += ', role = ?';
      queryParams.push(role);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);

    // Get updated customer
    const [updatedUser] = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.full_name as name,
        u.email,
        u.phone,
        u.address,
        u.is_active,
        u.created_at,
        u.role
      FROM users u
      WHERE u.id = ?`,
      [id]
    );

    const customer = updatedUser[0];
    return NextResponse.json({
      id: customer.id,
      name: customer.name || customer.username || 'Unknown',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      total_orders: 0,
      total_spent: 0,
      last_purchase_date: null,
      created_at: customer.created_at || null,
      status: customer.is_active === 1 ? 'active' : 'inactive',
      role: customer.role || 'staff'
    });
  } catch (error) {
    console.error('PUT Customer Error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer has orders
    const [orders] = await pool.query(
      'SELECT COUNT(*) as count FROM sales WHERE user_id = ?',
      [id]
    );

    if (orders[0].count > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete customer because they have ${orders[0].count} order(s) associated.`,
          orderCount: orders[0].count
        },
        { status: 400 }
      );
    }

    // Soft delete - set is_active to 0
    await pool.query(
      'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    return NextResponse.json({ 
      message: 'Customer deleted successfully' 
    });
  } catch (error) {
    console.error('DELETE Customer Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
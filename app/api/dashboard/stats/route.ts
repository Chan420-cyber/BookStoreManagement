import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get total books
    const [totalBooksResult] = await pool.query(
      'SELECT COUNT(*) as count FROM books WHERE is_active = 1'
    );
    const totalBooks = totalBooksResult[0].count;

    // Get total categories
    const [totalCategoriesResult] = await pool.query(
      'SELECT COUNT(*) as count FROM categories'
    );
    const totalCategories = totalCategoriesResult[0].count;

    // Get low stock books (1-5)
    const [lowStockResult] = await pool.query(
      'SELECT COUNT(*) as count FROM books WHERE stock_quantity BETWEEN 1 AND 5 AND is_active = 1'
    );
    const lowStockBooks = lowStockResult[0].count;

    // Get out of stock books (0)
    const [outOfStockResult] = await pool.query(
      'SELECT COUNT(*) as count FROM books WHERE stock_quantity = 0 AND is_active = 1'
    );
    const outOfStockBooks = outOfStockResult[0].count;

    // Get total orders
    const [totalOrdersResult] = await pool.query(
      'SELECT COUNT(*) as count FROM sales'
    );
    const totalOrders = totalOrdersResult[0].count || 0;

    // Get today's sales
    const [todaySalesResult] = await pool.query(
      'SELECT COALESCE(SUM(final_amount), 0) as total FROM sales WHERE DATE(sale_date) = CURDATE()'
    );
    const todaySales = parseFloat(todaySalesResult[0].total) || 0;

    // Get monthly revenue
    const [monthlyRevenueResult] = await pool.query(
      'SELECT COALESCE(SUM(final_amount), 0) as total FROM sales WHERE MONTH(sale_date) = MONTH(CURDATE()) AND YEAR(sale_date) = YEAR(CURDATE())'
    );
    const monthlyRevenue = parseFloat(monthlyRevenueResult[0].total) || 0;

    // Get active customers
    const [activeCustomersResult] = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM sales'
    );
    const activeCustomers = activeCustomersResult[0].count || 0;

    // Get recent books
    const [recentBooks] = await pool.query(`
      SELECT 
        b.id, 
        b.title, 
        b.author, 
        b.price, 
        b.stock_quantity as stock,
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
      LIMIT 5
    `);

    // Best Sellers (Mock Data - Replace with actual sales data)
    const bestSellers = [
      { 
        title: 'The Great Gatsby', 
        author: 'F. Scott Fitzgerald', 
        sales: 342, 
        rating: 4.8,
        revenue: 4432.58
      },
      { 
        title: 'To Kill a Mockingbird', 
        author: 'Harper Lee', 
        sales: 287, 
        rating: 4.9,
        revenue: 4298.13
      },
      { 
        title: '1984', 
        author: 'George Orwell', 
        sales: 256, 
        rating: 4.7,
        revenue: 3574.44
      },
      { 
        title: 'The Hobbit', 
        author: 'J.R.R. Tolkien', 
        sales: 198, 
        rating: 4.6,
        revenue: 3166.02
      },
      { 
        title: 'Python Programming', 
        author: 'Guido van Rossum', 
        sales: 156, 
        rating: 4.5,
        revenue: 7798.44
      }
    ];

    // Recent Orders (Mock Data)
    const recentOrders = [
      { id: 1001, customer: 'John Doe', total: 45.99, status: 'Completed', date: '2024-01-15 14:30' },
      { id: 1002, customer: 'Jane Smith', total: 89.50, status: 'Processing', date: '2024-01-15 13:15' },
      { id: 1003, customer: 'Bob Johnson', total: 23.75, status: 'Completed', date: '2024-01-14 16:45' },
      { id: 1004, customer: 'Alice Brown', total: 67.20, status: 'Pending', date: '2024-01-14 11:20' },
      { id: 1005, customer: 'Charlie Wilson', total: 34.99, status: 'Completed', date: '2024-01-13 09:30' },
    ];

    // Recent Activities (Mock Data)
    const recentActivities = [
      { message: 'New order #1006 placed by Sarah Connor', time: '2 minutes ago', type: 'order' },
      { message: 'Book "Python Programming" restocked with 50 units', time: '15 minutes ago', type: 'book' },
      { message: 'New customer David Miller registered', time: '1 hour ago', type: 'customer' },
      { message: 'Category "Science Fiction" was updated', time: '3 hours ago', type: 'category' },
      { message: 'Order #1003 marked as completed', time: '5 hours ago', type: 'order' },
      { message: 'Low stock alert: "1984" has only 2 copies left', time: '6 hours ago', type: 'alert' },
    ];

    return NextResponse.json({
      totalBooks,
      totalCategories,
      lowStockBooks,
      outOfStockBooks,
      totalOrders,
      todaySales,
      monthlyRevenue,
      activeCustomers,
      recentBooks: recentBooks || [],
      recentOrders,
      recentActivities,
      bestSellers
    });

  } catch (error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json({ 
      totalBooks: 0,
      totalCategories: 0,
      lowStockBooks: 0,
      outOfStockBooks: 0,
      totalOrders: 0,
      todaySales: 0,
      monthlyRevenue: 0,
      activeCustomers: 0,
      recentBooks: [],
      recentOrders: [],
      recentActivities: [],
      bestSellers: []
    }, { status: 500 });
  }
}
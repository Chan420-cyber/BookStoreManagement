# Bookstore Management System - Admin Dashboard

A modern, responsive admin dashboard for managing a bookstore's inventory, categories, customers, and analytics.

## Features

### 📊 Dashboard Overview
- **Stats Cards** showing:
  - Total Books (2,847)
  - Total Categories (24)
  - Low Stock Books (156)
  - Active Customers (3,295)
  - Real-time metrics with trend indicators

### 📚 Book Inventory Management
- **Comprehensive Table** with:
  - Book Title, Author, Category, Price, Stock quantity
  - Real-time stock status (In Stock, Low Stock, Out of Stock)
  - Edit and Delete actions for each book
  - Bulk selection with checkboxes
  - Add Book button to create new inventory items

### 🎨 Modern UI/UX
- **Left Sidebar Navigation** with:
  - Dashboard
  - Books
  - Categories
  - Inventory
  - Customers
  - Settings
  - Logout
- **Top Header** featuring:
  - Search bar for books and authors
  - Notification bell with indicator
  - Settings access
  - Profile avatar
- **Professional Dark Theme** with:
  - Blue accent color (#5B4FB5)
  - Orange secondary accent (#D97706)
  - Clean, readable typography
  - Smooth hover transitions

### 📱 Responsive Design
- **Fully responsive** layout that adapts to all screen sizes
- Mobile-friendly sidebar with toggle menu
- Touch-optimized controls
- Responsive grid layout for stats cards
- Horizontal scrolling table on mobile devices

## Technical Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.2 with semantic design tokens
- **UI Components**: Lucide React Icons
- **Typography**: Geist font family

## Component Structure

```
components/
├── sidebar.tsx          # Left navigation with menu items
├── header.tsx           # Top header with search and profile
├── stats-cards.tsx      # Dashboard metrics cards
└── inventory-table.tsx  # Book inventory table with CRUD operations
```

## Color System

The dashboard uses a carefully curated 4-color system:
- **Primary**: Blue (`#5B4FB5`) - Main brand color
- **Secondary**: Orange (`#D97706`) - Accent and highlights
- **Background**: Dark (`#1B1B1B`) - Main background
- **Neutrals**: Grays and whites for text and borders

## Design Highlights

- ✨ Smooth transitions and hover effects
- 🎯 Clear visual hierarchy with typography
- 🔄 Interactive status badges (color-coded by stock level)
- 🎪 Gradient profile avatar
- 📊 Icon-enhanced stat cards for quick recognition
- 🔍 Prominent search bar for quick access

## Getting Started

1. **Clone or download** the project
2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- Click on sidebar items to navigate (currently links to #)
- Use the **Add Book** button to create new inventory items
- Click **Edit** (pencil icon) to modify book details
- Click **Delete** (trash icon) to remove books from inventory
- Select multiple books using checkboxes for batch operations
- Search for books using the search bar in the header
- Toggle the mobile menu using the hamburger icon on small screens

## Future Enhancements

- Modal dialogs for Add/Edit book forms
- Backend integration for data persistence
- Advanced filtering and sorting
- Pagination controls
- Real-time notifications
- User authentication
- Export/Import functionality
- Analytics charts and graphs

## License

This project is created with v0 by Vercel.

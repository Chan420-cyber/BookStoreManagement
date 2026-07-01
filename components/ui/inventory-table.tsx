'use client';

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
  status: string;
  category_name: string;
}

interface InventoryTableProps {
  books: Book[];
}

export function InventoryTable({ books }: InventoryTableProps) {
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No books found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{book.title}</td>
              <td className="px-6 py-4">{book.author}</td>
              <td className="px-6 py-4">{book.category_name || 'Uncategorized'}</td>
              <td className="px-6 py-4">${Number(book.price).toFixed(2)}</td>
              <td className="px-6 py-4">{book.stock}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  book.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                  book.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {book.status?.replace('_', ' ') || 'IN_STOCK'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
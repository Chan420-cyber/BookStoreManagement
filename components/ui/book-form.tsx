'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface BookFormProps {
  book?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category_id: book?.category_id || '',
    price: book?.price || '',
    stock_quantity: book?.stock_quantity || '',
    minimum_stock: book?.minimum_stock || '5',
    description: book?.description || '',
    publisher: book?.publisher || '',
    edition: book?.edition || '',
    publication_year: book?.publication_year || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = book ? `/api/books/${book.id}` : '/api/books';
      const method = book ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          minimum_stock: parseInt(formData.minimum_stock),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          publication_year: formData.publication_year ? parseInt(formData.publication_year) : null
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('An error occurred while saving the book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">{book ? 'Edit Book' : 'Add New Book'}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="text"
          placeholder="Author *"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="text"
          placeholder="ISBN"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        
        <input
          type="number"
          step="0.01"
          placeholder="Price *"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="number"
          placeholder="Stock Quantity *"
          value={formData.stock_quantity}
          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="number"
          placeholder="Minimum Stock"
          value={formData.minimum_stock}
          onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="Publisher"
          value={formData.publisher}
          onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="Edition"
          value={formData.edition}
          onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="number"
          placeholder="Publication Year"
          value={formData.publication_year}
          onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
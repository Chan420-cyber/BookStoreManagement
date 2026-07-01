'use client';

import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: number;
  title: string;
  author: string;
  stock_quantity: number;
  minimum_stock: number;
  status: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Inventory</h1>
        <p className="text-gray-400">Track and manage your stock levels</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Book Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-white">{item.title}</td>
                <td className="px-6 py-4 text-gray-300">{item.author}</td>
                <td className="px-6 py-4">
                  <span className={item.stock_quantity < 10 ? 'text-red-400 font-semibold' : 'text-gray-300'}>
                    {item.stock_quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{item.minimum_stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'IN_STOCK' ? 'bg-green-900 text-green-300' :
                    item.status === 'LOW_STOCK' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {item.status?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
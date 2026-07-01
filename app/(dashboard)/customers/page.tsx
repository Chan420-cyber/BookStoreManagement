'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  total_orders: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Customers</h1>
        <p className="text-gray-400">Manage your customer database</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-700 p-3 rounded-full">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{customer.name}</h3>
                <p className="text-sm text-gray-400">Customer since {new Date().getFullYear()}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Phone size={16} />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              <div className="pt-3 mt-2 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Orders:</span>
                  <span className="text-white font-semibold">{customer.total_orders || 0}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400">Total Spent:</span>
                  <span className="text-green-400 font-semibold">${(customer.total_spent || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
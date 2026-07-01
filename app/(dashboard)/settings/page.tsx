'use client';

import { useState } from 'react';
import { Bell, Shield, User, Palette, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'general', name: 'General', icon: Globe },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and application preferences</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-700">
          <div className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" defaultValue="Admin User" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" defaultValue="admin@bookstore.com" />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                  <input type="password" className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                  <input type="password" className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg" />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Update Password</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <select className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System Default</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive email updates about your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  change?: string;
  icon: LucideIcon | ReactNode;
  color: string;
  subtitle?: string;
  gradient?: string;
  borderColor?: string;
  suffix?: string;
  progress?: number;
}

interface StatsCardsProps {
  stats: StatCard[];
  variant?: 'dashboard' | 'compact';
  className?: string;
}

export default function StatsCards({ stats, variant = 'dashboard', className = '' }: StatsCardsProps) {
  // Helper function to render icons safely
  const renderIcon = (icon: LucideIcon | ReactNode, size: number = 24) => {
    if (!icon) return null;
    
    // If it's a LucideIcon component (has a render method)
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="text-white" size={size} />;
    }
    
    // If it's already a React element
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    // If it's an object with $$typeof (React component)
    if (typeof icon === 'object' && icon !== null && '$$typeof' in icon) {
      try {
        const Component = icon;
        return <Component className="text-white" size={size} />;
      } catch {
        return null;
      }
    }
    
    return null;
  };

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>  {/* ← ADDED className HERE */}
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`relative ${stat.gradient || 'bg-gray-800/50'} bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-5 border ${stat.borderColor || 'border-gray-700/50'} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer overflow-hidden`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${stat.gradient || ''}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${stat.color} p-1.5 rounded-lg`}>
                  {renderIcon(stat.icon, 18)}
                </div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {(stat.title === 'Inventory Value' || stat.title === "Today's Sales" || stat.title === 'Monthly Revenue') && typeof stat.value === 'number' ? '$' : ''}
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                {stat.suffix || ''}
              </p>
              {stat.subtitle && (
                <p className="text-gray-500 text-xs mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 rounded-b-2xl overflow-hidden">
              <div 
                className={`h-full ${stat.color} transition-all duration-1000 group-hover:opacity-100`} 
                style={{ 
                  width: `${Math.min(stat.progress || 100, 100)}%`, 
                  opacity: 0.7 
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Dashboard variant - Reduce height
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`relative bg-gradient-to-br ${stat.gradient || 'from-gray-800/50 to-gray-800/30'} bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border ${stat.borderColor || 'border-gray-700/50'} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer overflow-hidden`}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${stat.gradient || ''}`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <div className={`${stat.color} p-2 rounded-lg shadow-lg transition-all duration-300 group-hover:scale-110`}>
                {renderIcon(stat.icon, 18)}
              </div>
              {stat.change && (
                <span className={`text-[10px] font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-gray-400 text-[10px] font-medium mb-0.5 uppercase tracking-wider">{stat.title}</h3>
            <p className="text-xl font-bold text-white tracking-tight">
              {(stat.title === "Today's Sales" || stat.title === 'Monthly Revenue') && typeof stat.value === 'number' ? '$' : ''}
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              {stat.suffix || ''}
            </p>
            {stat.subtitle && (
              <p className="text-gray-500 text-[10px] mt-0.5">{stat.subtitle}</p>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-700/50 rounded-b-xl overflow-hidden">
            <div 
              className={`h-full ${stat.color} transition-all duration-1000 group-hover:opacity-100`} 
              style={{ 
                width: `${Math.min(stat.progress || 100, 100)}%`, 
                opacity: 0.7 
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
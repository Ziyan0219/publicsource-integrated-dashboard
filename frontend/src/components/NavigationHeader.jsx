import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Home, Upload, Search, BarChart3, Brain, LogOut } from 'lucide-react';

const NavigationHeader = ({ onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/keyword-search', icon: Search, label: 'Search' },
    { path: '/stats', icon: BarChart3, label: 'Analytics' },
    { path: '/ai-analytics', icon: Brain, label: 'AI Strategy' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-full mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PublicSource</h1>
              <p className="text-xs text-gray-500">News Dashboard</p>
            </div>
          </div>
          
          {/* Main Navigation - All Equal Level */}
          <nav className="flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link 
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 inline-block mr-2" />
                {label}
              </Link>
            ))}
            
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 inline-block mr-2" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
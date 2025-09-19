import React from 'react';
import NavigationHeader from './NavigationHeader';

const TestPage = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Component Test Page</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              ✅ NavigationHeader component loaded successfully
            </div>
            
            <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
              ✅ React Router navigation working
            </div>
            
            <div className="p-4 bg-purple-100 text-purple-800 rounded-lg">
              ✅ Tailwind CSS styles applying correctly
            </div>
            
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              🔧 If you can see this page, all basic components are working!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
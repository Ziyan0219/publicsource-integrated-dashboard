import React from 'react';
import { Upload } from 'lucide-react';
import UploadExcel from './UploadExcel';
import NavigationHeader from './NavigationHeader';

const UploadPage = ({ onLogout, onUploadSuccess }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader onLogout={onLogout} />

      {/* Main Content */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-full mx-auto py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload & Process Data</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your Excel files to automatically classify stories, extract locations, 
            and generate social media abstracts using AI-powered processing.
          </p>
        </div>

        {/* Upload Component */}
        <div className="animate-fade-in">
          <UploadExcel onUploadSuccess={onUploadSuccess} />
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload File</h3>
              <p className="text-gray-600 text-sm">
                Drag and drop or select your Excel/CSV file containing story URLs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                Our AI crawls URLs, extracts content, titles, authors, and publication dates
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Classification</h3>
              <p className="text-gray-600 text-sm">
                Automatically classifies geographic areas, neighborhoods, and categories
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ready to View</h3>
              <p className="text-gray-600 text-sm">
                Processed stories appear on your dashboard with enhanced metadata
              </p>
            </div>
          </div>
        </div>

        {/* Data Processing Features */}
        <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Enhanced Data Processing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Content Extraction</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Article titles and headlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Author information</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Publication dates</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Full article content for analysis</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">AI Classification</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Geographic area detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Neighborhood identification</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Social media abstracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Duplicate detection & removal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
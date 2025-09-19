import React, { useState } from 'react';
import { Search, FileText, AlertCircle } from 'lucide-react';
import StaticStoryCard from './StaticStoryCard';
import NavigationHeader from './NavigationHeader';

const KeywordSearch = ({ stories, onLogout }) => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setIsSearched(false);
      return;
    }

    const results = stories.filter(story => 
      story.social_abstract.toLowerCase().includes(keyword.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearched(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <NavigationHeader onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Area */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Content-Based Smart Search</h2>
            <p className="text-gray-600">Find relevant stories based on keywords in article abstracts</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter keywords to search story content..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Tips */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Search Tips:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Search is based on social media abstracts content</li>
                    <li>• Supports both English keywords</li>
                    <li>• Search is case-insensitive</li>
                    <li>• Advanced search features coming soon</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {isSearched && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Search Results
              </h3>
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{searchResults.length}</span> matching stories
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(story => (
                  <StaticStoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching stories found</h3>
                <p className="text-gray-500 mb-4">
                  No stories found containing the keyword "<span className="font-medium">{keyword}</span>"
                </p>
                <p className="text-sm text-gray-400">
                  Try using different keywords or return to the dashboard to browse all stories
                </p>
              </div>
            )}
          </div>
        )}

        {/* Future Features Preview */}
        {!isSearched && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Search</h4>
                  <p className="text-sm text-gray-600">Support for multi-keyword combinations, phrase search, and exclusion terms</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600">AI-powered story recommendations based on search history and reading preferences</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Content Analytics</h4>
                  <p className="text-sm text-gray-600">Keyword trend analysis and content performance statistics</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordSearch;


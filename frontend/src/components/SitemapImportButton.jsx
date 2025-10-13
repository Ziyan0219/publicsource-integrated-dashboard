import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const SitemapImportButton = ({ onImportSuccess }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async (testMode = false) => {
    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/import-sitemap-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_mode: testMode,
          max_articles: testMode ? 10 : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);

      // Notify parent component to refresh data
      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
        }, 1000);
      }

    } catch (err) {
      setError(err.message || 'An error occurred during import');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 rounded-xl p-3">
          <Download className="h-6 w-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Import from PublicSource Sitemap
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Automatically fetch and classify all articles from PublicSource's sitemap.
            This will import approximately 1000-1500 articles.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handleImport(true)}
              disabled={isImporting}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Test Import (10 articles)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleImport(false)}
              disabled={isImporting}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Full Import (All Articles)</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {importResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-2">
                    {importResult.message || 'Import Successful!'}
                  </p>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Total URLs from sitemaps: <span className="font-medium">{importResult.total_urls}</span></p>
                    <p>Already in database: <span className="font-medium">{importResult.existing_urls}</span></p>
                    <p>New articles found: <span className="font-medium">{importResult.new_urls}</span></p>
                    <p>Successfully processed: <span className="font-medium">{importResult.processed}</span></p>
                    <p>Total stories now: <span className="font-medium">{importResult.total_stories}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-1">Import Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State Details */}
          {isImporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">Processing...</p>
                  <p className="text-sm text-blue-700">
                    Fetching sitemap URLs, extracting article content, and classifying geographic data.
                    This may take several minutes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitemapImportButton;

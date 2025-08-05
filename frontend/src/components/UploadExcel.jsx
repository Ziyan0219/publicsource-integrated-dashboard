import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';

const UploadExcel = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      setUploadStatus('error');
      setUploadMessage('Please upload Excel files (.xlsx, .xls) or CSV files');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setUploadMessage(`Successfully processed ${result.processed_count} records, added ${result.new_count} new, ${result.duplicate_count} duplicates`);
        
        // Notify parent component to refresh data
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } else {
        setUploadStatus('error');
        setUploadMessage(result.error || 'Upload failed, please try again');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Network error, please check connection and try again');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          </div>
          <span>Upload Raw Excel File</span>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </h3>
      </div>

      <div
        className={`relative border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="space-y-6">
          {isUploading ? (
            <>
              <div className="relative">
                <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-blue-700 font-semibold text-lg">Processing file, please wait...</p>
                <div className="mt-3 w-64 mx-auto bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-green-700 font-bold text-xl">Upload successful!</p>
                <p className="text-green-600 mt-2 bg-green-100 rounded-lg p-3 border border-green-200">{uploadMessage}</p>
              </div>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <div>
                <p className="text-red-700 font-bold text-xl">Upload failed</p>
                <p className="text-red-600 mt-2 bg-red-100 rounded-lg p-3 border border-red-200">{uploadMessage}</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-xl mb-3">
                  Drag and drop Excel file here, or click to select file
                </p>
                <p className="text-gray-500 text-lg">
                  Supports .xlsx, .xls, .csv formats
                </p>
              </div>
            </>
          )}
        </div>

        {!isUploading && (
          <button
            type="button"
            className="mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Select File
          </button>
        )}
      </div>

      {uploadStatus && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Powered Processing Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-700">Content Enrichment</p>
                <p className="text-sm text-gray-600">AI algorithm enhances Excel content</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-700">Smart Abstracts</p>
                <p className="text-sm text-gray-600">Generate social media abstracts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-700">Auto Classification</p>
                <p className="text-sm text-gray-600">Classify geographic areas and neighborhoods</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-700">Duplicate Detection</p>
                <p className="text-sm text-gray-600">Check and remove duplicates automatically</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;


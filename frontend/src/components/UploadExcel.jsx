import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          <span>Upload Raw Excel File</span>
        </h3>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
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

        <div className="space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
              <p className="text-gray-600">Processing file, please wait...</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-green-700 font-medium">Upload successful!</p>
              <p className="text-sm text-green-600">{uploadMessage}</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <p className="text-red-700 font-medium">Upload failed</p>
              <p className="text-sm text-red-600">{uploadMessage}</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop Excel file here, or click to select file
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx, .xls, .csv formats
                </p>
              </div>
            </>
          )}
        </div>

        {!isUploading && (
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            Select File
          </button>
        )}
      </div>

      {uploadStatus && (
        <div className="mt-4 text-sm text-gray-600">
          <p>The system will automatically:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use AI algorithm to enrich Excel content</li>
            <li>Generate social media abstracts</li>
            <li>Classify geographic areas and neighborhoods</li>
            <li>Check for duplicates and remove them</li>
            <li>Update frontend database</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;


import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const UploadButton = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

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
      setTimeout(() => setUploadStatus(null), 3000);
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
        setUploadMessage(`Successfully processed ${result.processed_count} records`);
        
        // Notify parent component to refresh data
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
        
        // Clear status after 3 seconds
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus('error');
        setUploadMessage(result.error || 'Upload failed');
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Network error');
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const getButtonContent = () => {
    if (isUploading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Uploading...</span>
        </>
      );
    }
    
    if (uploadStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="hidden sm:inline">Success</span>
        </>
      );
    }
    
    if (uploadStatus === 'error') {
      return (
        <>
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="hidden sm:inline">Error</span>
        </>
      );
    }
    
    return (
      <>
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Upload Excel</span>
      </>
    );
  };

  const getButtonClass = () => {
    const baseClass = "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shadow-lg transition-all duration-200 hover:shadow-xl";
    
    if (uploadStatus === 'success') {
      return `${baseClass} bg-green-100 text-green-800 border border-green-300`;
    }
    
    if (uploadStatus === 'error') {
      return `${baseClass} bg-red-100 text-red-800 border border-red-300`;
    }
    
    if (isUploading) {
      return `${baseClass} bg-blue-100 text-blue-800 border border-blue-300 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer`;
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileInput}
        className="hidden"
        id="upload-input"
        disabled={isUploading}
      />
      <label
        htmlFor="upload-input"
        className={getButtonClass()}
        title={uploadMessage || "Upload Excel file"}
      >
        {getButtonContent()}
      </label>
      
      {/* Status message tooltip */}
      {uploadMessage && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className={`text-sm ${
            uploadStatus === 'success' ? 'text-green-700' : 
            uploadStatus === 'error' ? 'text-red-700' : 'text-gray-700'
          }`}>
            {uploadMessage}
          </p>
        </div>
      )}
    </>
  );
};

export default UploadButton;


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
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200";
    
    if (uploadStatus === 'success') {
      return `${baseClass} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100`;
    }
    
    if (uploadStatus === 'error') {
      return `${baseClass} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`;
    }
    
    if (isUploading) {
      return `${baseClass} bg-blue-50 text-blue-700 border border-blue-200 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-white/60 text-slate-600 border border-gray-200/60 hover:bg-white/80 hover:text-slate-900 cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md`;
  };

  return (
    <div className="relative">
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
      
      {/* Status message tooltip - positioned relative to parent */}
      {uploadMessage && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-white/90 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-lg p-3 max-w-xs">
          <p className={`text-xs ${
            uploadStatus === 'success' ? 'text-green-700' : 
            uploadStatus === 'error' ? 'text-red-700' : 'text-slate-700'
          }`}>
            {uploadMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadButton;


import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

const UploadPage = ({ onUploadSuccess, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState(null);

  // Mock preview data processing
  const processFilePreview = (file) => {
    // In real implementation, this would parse the Excel/CSV file
    return [
      { 
        id: 1, 
        url: 'https://example.com/story1', 
        title: 'Sample Story 1', 
        status: 'valid',
        conflicts: []
      },
      { 
        id: 2, 
        url: 'https://example.com/story2', 
        title: 'Sample Story 2', 
        status: 'duplicate',
        conflicts: ['URL already exists']
      },
      { 
        id: 3, 
        url: 'https://example.com/story3', 
        title: 'Sample Story 3', 
        status: 'valid',
        conflicts: []
      }
    ];
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload Excel (.xlsx, .xls) or CSV files only.'
      });
      return;
    }

    setSelectedFile(file);
    const preview = processFilePreview(file);
    setPreviewData(preview);

    // Mock validation
    const validation = {
      totalRows: preview.length,
      validRows: preview.filter(row => row.status === 'valid').length,
      duplicateRows: preview.filter(row => row.status === 'duplicate').length,
      errorRows: preview.filter(row => row.status === 'error').length
    };
    setValidationResults(validation);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        toast.success('Upload successful!', {
          description: `Processed ${result.processed_count} stories, added ${result.new_count} new stories.`
        });
        
        // Reset state
        setSelectedFile(null);
        setPreviewData([]);
        setValidationResults(null);
        setUploadProgress(0);
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        const error = await response.json();
        toast.error('Upload failed', {
          description: error.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      toast.error('Upload failed', {
        description: 'Network error occurred while uploading'
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setValidationResults(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
          <CardDescription>
            Upload Excel or CSV files containing story URLs for processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-dashed border-2 min-h-48 rounded-lg flex flex-col items-center justify-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="text-center space-y-4">
                <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="outline" onClick={clearFile}>
                  <X className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports Excel (.xlsx, .xls) and CSV files
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                />
                <label htmlFor="file-upload">
                  <Button asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResults.totalRows}
                </div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.validRows}
                </div>
                <div className="text-sm text-gray-600">Valid</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResults.duplicateRows}
                </div>
                <div className="text-sm text-gray-600">Duplicates</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.errorRows}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>File Preview</CardTitle>
              <CardDescription>Preview of parsed data structure</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Complete Data Preview</DialogTitle>
                  <DialogDescription>
                    All {previewData.length} rows from the uploaded file
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">URL</th>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row) => (
                        <tr key={row.id} className="border-b">
                          <td className="p-2">
                            <Badge variant={
                              row.status === 'valid' ? 'default' :
                              row.status === 'duplicate' ? 'secondary' : 'destructive'
                            }>
                              {row.status}
                            </Badge>
                          </td>
                          <td className="p-2 font-mono text-xs truncate max-w-xs">
                            {row.url}
                          </td>
                          <td className="p-2 truncate max-w-xs">{row.title}</td>
                          <td className="p-2">
                            {row.conflicts.length > 0 && (
                              <span className="text-red-600 text-xs">
                                {row.conflicts.join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">URL</th>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Badge variant={
                          row.status === 'valid' ? 'default' :
                          row.status === 'duplicate' ? 'secondary' : 'destructive'
                        }>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs truncate max-w-xs">
                        {row.url}
                      </td>
                      <td className="p-2 truncate max-w-xs">{row.title}</td>
                      <td className="p-2">
                        {row.conflicts.length > 0 && (
                          <span className="text-red-600 text-xs">
                            {row.conflicts.join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {previewData.length - 5} more rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing upload...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Actions */}
      {selectedFile && validationResults && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Upload</CardTitle>
            <CardDescription>
              Review the validation results and proceed with the upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResults.duplicateRows > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResults.duplicateRows} duplicate entries found. 
                    These will be skipped during upload.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleUpload}
                  disabled={validationResults.validRows === 0}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Upload {validationResults.validRows} Valid Stories
                </Button>
                <Button variant="outline" onClick={clearFile}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;
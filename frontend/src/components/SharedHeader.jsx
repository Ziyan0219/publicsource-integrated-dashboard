import React from 'react';
import { FileText, LogOut, Filter, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner';

const SharedHeader = ({ 
  activeTab, 
  metrics, 
  onLogout, 
  showFilterSidebar, 
  setShowFilterSidebar 
}) => {
  const handleExport = () => {
    toast.info('Downloading report...');
    setTimeout(() => toast.success('Report downloaded successfully!'), 2000);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-shrink-0">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">PublicSource Analytics</h1>
              <p className="text-sm text-gray-500">Modern Data Platform</p>
            </div>
            <Badge variant="outline" className="ml-4">
              {metrics.totalStories} Stories
            </Badge>
          </div>
          
          <nav className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              className={showFilterSidebar ? "bg-gray-100" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SharedHeader;
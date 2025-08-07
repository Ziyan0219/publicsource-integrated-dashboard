import React, { useState } from 'react';
import { Settings, Database, Bell, Shield, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

const SettingsPage = ({ metrics }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure your PublicSource Analytics experience
          </CardDescription>
        </CardHeader>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-gray-500">
                Choose your preferred color scheme
              </div>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Language</div>
              <div className="text-sm text-gray-500">
                Select your preferred language
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-500">
                Receive alerts for new uploads and system updates
              </div>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Refresh</div>
              <div className="text-sm text-gray-500">
                Automatically refresh data every 5 minutes
              </div>
            </div>
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your data storage and processing settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Storage Usage</div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(metrics.totalStories * 0.15).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-500">
                Used of 1 GB available
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Cache Size</div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {(metrics.totalStories * 0.05).toFixed(1)} MB
              </div>
              <div className="text-sm text-gray-500">
                Article text cache
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button variant="outline">
              Clear Cache
            </Button>
            <Button variant="outline">
              Export All Data
            </Button>
            <Button variant="destructive">
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage security and access settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Security Status</span>
            </div>
            <p className="text-sm text-green-700">
              Your session is secure and authenticated
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Session Information</div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Access Code: publicsource-cmu</div>
                <div>Login Time: {new Date().toLocaleString()}</div>
                <div>IP Address: 127.0.0.1</div>
              </div>
            </div>

            <Separator />

            <Button variant="outline" className="w-full">
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600">Version</div>
                <div className="text-sm">v2.1.0</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Last Updated</div>
                <div className="text-sm">{new Date().toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Server Status</div>
                <div className="text-sm text-green-600">Online</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600">API Status</div>
                <div className="text-sm text-green-600">Connected</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Processing Queue</div>
                <div className="text-sm">0 pending</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Uptime</div>
                <div className="text-sm">99.9%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
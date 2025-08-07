import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import Dashboard from './components/Dashboard';
import KeywordSearch from './components/KeywordSearch';
import Login from './components/Login';
import storiesData from './data/stories.json';
import './App.css';

function App() {
  const [stories, setStories] = useState([]);
  const [filters, setFilters] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to process filters from stories data (same logic as backend)
  const processFilters = (stories) => {
    const umbrellas = new Set();
    const geographicAreas = new Set();
    const neighborhoods = new Set();

    stories.forEach(story => {
      // Process umbrella/categories
      if (story.umbrella) {
        const umbrellaValues = story.umbrella.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        umbrellaValues.forEach(value => umbrellas.add(value));
      }

      // Process geographic areas
      if (story.geographic_area) {
        const geoValues = story.geographic_area.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        geoValues.forEach(value => geographicAreas.add(value));
      }

      // Process neighborhoods
      if (story.neighborhoods) {
        const neighborhoodValues = story.neighborhoods.split(/[,;/|]/).map(v => v.trim()).filter(v => v);
        neighborhoodValues.forEach(value => neighborhoods.add(value));
      }
    });

    return {
      umbrellas: Array.from(umbrellas).sort(),
      geographic_areas: Array.from(geographicAreas).sort(),
      neighborhoods: Array.from(neighborhoods).sort()
    };
  };

  const loadData = useCallback(async () => {
    try {
      // Try to fetch fresh data from backend
      const response = await fetch('/api/refresh-data');
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
        setFilters(data.filters);
      } else {
        // Fallback to local data with client-side filter processing
        setStories(storiesData.stories);
        const processedFilters = processFilters(storiesData.stories);
        setFilters(processedFilters);
      }
    } catch {
      // Fallback to local data if backend is not available
      console.log('Backend not available, using local data with client-side processing');
      setStories(storiesData.stories);
      const processedFilters = processFilters(storiesData.stories);
      setFilters(processedFilters);
    }
  }, []);

  useEffect(() => {
    loadData();
    
    // Check if user is already authenticated (stored in sessionStorage)
    const authStatus = sessionStorage.getItem('publicsource-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, [loadData]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Store authentication status in sessionStorage (expires when browser closes)
    sessionStorage.setItem('publicsource-auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('publicsource-auth');
  };

  const handleDataUpdate = () => {
    // Refresh data when upload is successful
    loadData();
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="App">
          <Login onLogin={handleLogin} />
        </div>
      </ThemeProvider>
    );
  }

  // If authenticated, show the dashboard
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard stories={stories} filters={filters} onLogout={handleLogout} onDataUpdate={handleDataUpdate} />} 
            />
            <Route 
              path="/keyword-search" 
              element={<KeywordSearch stories={stories} onLogout={handleLogout} />} 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;


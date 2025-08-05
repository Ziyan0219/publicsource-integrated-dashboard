# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend Development
```bash
# Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the Flask server
python src/main.py        # Serves both API and frontend (port 5000)
```

### Full Stack Development
For development, run both servers:
- Frontend: `cd frontend && npm run dev` (port 5173)
- Backend: `python src/main.py` (port 5000)

## Architecture Overview

This is a full-stack news classification dashboard with three main components:

### Frontend (`/frontend`)
- **Framework**: React 18 + Vite + Tailwind CSS
- **Key Libraries**: React Router, Radix UI components, Lucide icons
- **Structure**: Component-based architecture with hooks for state management
- **Authentication**: Session-based with access code `publicsource-cmu`

### Backend (`/src`)
- **Framework**: Flask with CORS enabled
- **Database**: Currently JSON-based storage (`src/data/stories.json`)
- **APIs**: Excel upload processing (`/api/upload-excel`), data refresh (`/api/refresh-data`)
- **Deployment**: Flask serves both API and built frontend files

### AI Classification (`archive_classifier_final.py`)
- **Purpose**: Processes uploaded Excel files with OpenAI integration
- **Features**: Web scraping, geographic classification, AI teaser generation
- **Requirements**: OpenAI API key in environment variables

## Key Components Architecture

### Data Flow
1. **Excel Upload** → Flask API → Classification Pipeline → JSON Storage → Frontend Refresh
2. **Frontend** loads data from API first, falls back to local JSON if backend unavailable
3. **Filters** are dynamically generated from story data with multi-value field splitting

### Filter System
- **Backend**: Splits multi-value fields by separators (`,`, `;`, `/`, `|`) 
- **Frontend**: Multi-select interface with collapsible sections
- **State**: Array-based filter management for neighborhoods, geographic areas, categories

### Story Processing Pipeline
```
Excel/CSV Upload → URL Extraction → Web Scraping → Geographic Classification → 
AI Teaser Generation → Duplicate Detection → Data Merge → Filter Update
```

## Important File Locations

### Core Application Files
- `src/main.py` - Flask application entry point
- `src/routes/excel_upload.py` - File upload and data processing logic
- `frontend/src/App.jsx` - React root component with authentication
- `frontend/src/components/Dashboard.jsx` - Main dashboard interface
- `frontend/src/components/FilterPanel.jsx` - Multi-select filtering system

### Data Files
- `frontend/src/data/stories.json` - Primary data source (fallback)
- Story data structure includes: id, url, umbrella, geographic_area, neighborhoods, social_abstract

### Configuration
- `frontend/vite.config.js` - Vite configuration (port 5173, host 0.0.0.0)
- `frontend/eslint.config.js` - ESLint configuration with React rules
- `requirements.txt` - Python dependencies including Flask, OpenAI, pandas

## Development Guidelines

### Frontend
- Use existing Radix UI components from `components/ui/` directory
- Follow Tailwind CSS utility-first approach
- Implement responsive design patterns
- Use React hooks for state management (no external state library)

### Backend
- Follow Flask blueprint pattern for routes
- Maintain CORS configuration for cross-origin requests
- Use pandas for Excel/CSV processing
- Implement proper error handling with JSON responses

### Data Processing
- Handle multi-value fields with consistent separator splitting
- Maintain filter uniqueness and sorting
- Implement duplicate detection using URL hashing
- Follow Social Media Voice Guidelines for AI teaser generation

## Environment Setup

### Required Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key  # Required for AI classification
```

### Dependencies
- **Python**: 3.11+ with Flask, pandas, OpenAI, BeautifulSoup4
- **Node.js**: 20+ with React 18, Vite, Tailwind CSS
- Package managers: npm (frontend), pip (backend)

## Testing and Linting

### Frontend
- ESLint configuration includes React hooks and refresh rules
- No unused vars except constants (^[A-Z_] pattern)
- Use `npm run lint` to check code quality

### Backend
- No formal testing framework currently configured
- Manual testing through Flask development server
- Error handling implemented for file uploads and API responses

## Deployment Notes

- Production: Flask serves both API and built frontend static files
- Frontend build outputs to `frontend/dist/`, copied to `src/static/`
- Single server deployment on port 5000
- CORS enabled for development cross-origin requests
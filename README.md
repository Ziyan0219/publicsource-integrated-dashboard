# PublicSource Integrated News Classification Dashboard

A comprehensive news classification system that combines frontend dashboard with backend processing capabilities for Excel file uploads and AI-powered content enhancement.

## Features

- **Modern Multi-Page Interface**: Tab-based navigation with dedicated Dashboard, Analytics, Upload, and Settings pages
- **Interactive Story Management**: Advanced story cards with social abstracts, geographic visualization, and filtering
- **Comprehensive Analytics**: Real-time charts, geographic distribution analysis, and trend visualization using Recharts
- **Centralized Upload System**: Drag-drop interface with file preview, validation, and conflict resolution
- **Persistent Filter System**: Collapsible sidebar with multi-select filters and active filter badges
- **Interactive Pittsburgh Map**: Geographic area visualization with hover interactions and dual highlighting
- **Excel Upload Processing**: Upload raw Excel files with automatic AI-powered content enhancement
- **AI Enhancement**: Automatic teaser generation using OpenAI with Social Media Voice Guidelines
- **Geographic Classification**: Automatic classification of stories by neighborhoods and geographic areas
- **Real-time Feedback**: Toast notifications, loading states, and progress indicators throughout the interface
- **Responsive Design**: Adaptive grid layouts with masonry-style cards and mobile responsiveness

## Architecture

### Frontend (`/frontend`)
- **Technology**: React 18 + Vite + Tailwind CSS + Radix UI Components
- **Architecture**: Multi-page tab-based navigation with dedicated page components
- **Core Pages**:
  - **Dashboard**: Story grid with interactive map integration and real-time filtering
  - **Analytics**: Comprehensive data visualization with Recharts (pie charts, bar charts, area charts)
  - **Upload**: Centralized Excel/CSV upload with drag-drop, file preview, and validation
  - **Settings**: User preferences, data management, and system configuration
- **Key Components**:
  - **SharedHeader**: Consistent navigation header with project branding and contextual actions
  - **FilterSidebar**: Persistent collapsible filter system (64px wide, multi-select checkboxes)
  - **ModernStoryCard**: Enhanced story cards with social abstracts, metadata footers, and hover effects
  - **PittsburghMap**: Interactive geographic visualization based on Pittsburgh areas with floating legend
- **Design System**: 4-unit grid spacing, semantic color palette, consistent typography hierarchy
- **Responsive Features**: Adaptive grid patterns (grid-cols-1 md:grid-cols-2 xl:grid-cols-3), mobile-optimized layouts

### Backend (`/src`)
- **Technology**: Flask + SQLAlchemy
- **APIs**: Excel upload processing, data refresh endpoints
- **Features**: CORS enabled, file validation, error handling

### Algorithm (`/archive_classifier_final.py`)
- **Technology**: Python + OpenAI + BeautifulSoup
- **Features**: Web scraping, geographic classification, teaser generation
- **Enhancement**: Improved prompts following Social Media Voice Guidelines

## Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenAI API Key

 1. env prep

  # make sure in the root
  cd C:\agents\publicsource-integrated-dashboard

  # activate virtue env
  # source venv/bin/activate  # Linux/Mac
  # venv\Scripts\activate     # Windows

  2. build backend

  pip install -r requirements.txt

  3. set up env

  # Windows CMD:
  set OPENAI_API_KEY=your-openai-api-key

  # Windows PowerShell:
  $env:OPENAI_API_KEY="your-openai-api-key"

  # Linux/Mac:
  export OPENAI_API_KEY="your-openai-api-key"

  4. build front end

  cd frontend
  npm install
  npm run build


  # return to root
  cd ..

  # Windows:
  xcopy /E /Y frontend\dist\* src\static\

  # Linux/Mac:
  cp -r frontend/dist/* src/static/

  6. start flask

  python src/main.py
```

The application will be available at `http://localhost:5000`

## Usage

### Access & Navigation
1. **Login**: Use access code `publicsource-cmu` to access the dashboard
2. **Navigation**: Use the tab-based interface to switch between:
   - **Dashboard**: Main story feed with interactive map
   - **Analytics**: Data visualization and metrics
   - **Upload**: File upload and processing
   - **Settings**: User preferences and system configuration

### Story Management
3. **Filtering**: Use the persistent left sidebar to filter by:
   - Categories (umbrella topics)
   - Geographic Areas (Pittsburgh regions)
   - Neighborhoods (specific districts)
   - Search terms across story content
4. **Interactive Map**: Hover over story cards to highlight corresponding geographic areas on the Pittsburgh map
5. **Story Cards**: View enhanced story cards with:
   - AI-generated social abstracts (italicized, distinctive styling)
   - Metadata footer with category and location badges
   - Neighborhood listings with overflow handling
   - Direct link to full stories

### File Upload & Processing
6. **Upload Interface**: Navigate to Upload tab for centralized file management:
   - Drag-drop zone with file validation
   - Preview table showing parsed data structure
   - Conflict resolution for duplicates
   - Batch update confirmation
7. **Processing Pipeline**: System automatically:
   - Extracts story URLs from Excel/CSV files
   - Scrapes article content with caching
   - Classifies geographic areas and neighborhoods
   - Generates social media teasers following voice guidelines
   - Detects and handles duplicates
   - Updates dashboard with real-time feedback

### Analytics & Insights
8. **Analytics Dashboard**: Access comprehensive data visualization:
   - Geographic distribution pie charts
   - Category breakdown bar charts
   - Temporal trend analysis with area charts
   - Export functionality for reports and data

## API Endpoints

- `POST /api/upload-excel`: Upload and process Excel files
- `GET /api/refresh-data`: Get latest stories and filters data

## Social Media Voice Guidelines

The teaser generation follows strict guidelines:
- Maintain consistent active voice
- Promote facts first, avoid editorializing
- Include quotes for personal perspectives
- Use calls-to-action (explore, examine, investigate)
- Ask questions the story can answer
- Show local community impact
- Follow AP Style, no Oxford comma
- Under 30 words, avoid clickbait

## File Structure

```
├── src/                           # Flask backend
│   ├── main.py                   # Main application entry
│   ├── routes/                   # API routes
│   │   ├── excel_upload.py       # File upload processing
│   │   └── user.py               # User authentication
│   ├── models/                   # Database models
│   └── static/                   # Built frontend files
├── frontend/                     # React frontend source
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── DashboardPage.jsx    # Main story grid & map
│   │   │   │   ├── AnalyticsPage.jsx    # Charts & metrics
│   │   │   │   ├── UploadPage.jsx       # File upload interface  
│   │   │   │   └── SettingsPage.jsx     # Configuration
│   │   │   ├── ui/              # Radix UI components
│   │   │   ├── Dashboard.jsx    # Main app container
│   │   │   ├── SharedHeader.jsx # Navigation header
│   │   │   ├── FilterSidebar.jsx # Persistent filter panel
│   │   │   ├── ModernStoryCard.jsx # Enhanced story cards
│   │   │   └── PittsburghMap.jsx # Interactive area map
│   │   ├── data/               # JSON data files
│   │   │   └── stories.json    # Story data & filters
│   │   └── hooks/              # Custom React hooks
│   └── dist/                   # Built files
├── archive_classifier_final.py  # Classification algorithm
├── requirements.txt            # Python dependencies
└── README.md                  # This file
```

## Deployment

The application is designed for easy deployment to cloud platforms. The Flask app serves both the API and the built frontend files.

## License

This project is developed for PublicSource news organization.


# PublicSource Integrated News Dashboard - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Filter System Implementation](#filter-system-implementation)
9. [Dependencies](#dependencies)
10. [Deployment Architecture](#deployment-architecture)

## Project Overview

The PublicSource Integrated News Dashboard is a comprehensive news classification and management system that combines:
- **Frontend Dashboard**: React-based interface for story browsing and filtering
- **Backend API**: Flask-based server for data processing and file uploads
- **AI Classification**: OpenAI-powered content enhancement and geographic classification
- **Excel Processing**: Automated pipeline for bulk story uploads and processing

### Key Features
- Interactive story dashboard with advanced filtering
- Excel/CSV file upload with automatic processing
- AI-powered teaser generation following Social Media Voice Guidelines
- Geographic classification (neighborhoods, areas, categories)
- Duplicate detection and data validation
- Real-time data updates and synchronization

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Flask)       │◄──►│   Services      │
│                 │    │                 │    │                 │
│ ├─ Dashboard    │    │ ├─ API Routes   │    │ ├─ OpenAI API   │
│ ├─ FilterPanel  │    │ ├─ File Upload  │    │ ├─ Web Scraping │
│ ├─ StoryCard    │    │ ├─ Data Proc.   │    │ └─ External URLs│
│ ├─ Upload       │    │ └─ Classification│    │                 │
│ └─ Search       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Storage  │
                    │                 │
                    │ ├─ stories.json │
                    │ ├─ Excel files  │
                    │ └─ Temp files   │
                    └─────────────────┘
```

## Backend Components

### 1. Main Application (`src/main.py`)
- **Purpose**: Entry point for the Flask application
- **Responsibilities**:
  - Initialize Flask app with CORS support
  - Register API blueprints
  - Serve static frontend files
  - Configure error handling

### 2. Excel Upload Route (`src/routes/excel_upload.py`)
- **Purpose**: Handle file uploads and processing
- **Key Functions**:
  - `upload_excel()`: Process uploaded Excel/CSV files
  - `refresh_data()`: Return latest stories and filter data
  - `load_existing_stories()`: Load stories from JSON file
  - `save_stories()`: Save updated stories and filters
  - `update_filters()`: Generate filter options from story data

#### Filter Generation Logic
```python
def update_filters(stories):
    # Extract unique values from all stories
    # Split multi-value entries by separators: , ; / |
    # Remove empty strings and duplicates
    # Return sorted lists for each filter type
```

### 3. Classification Algorithm (`archive_classifier_final.py`)
- **Purpose**: AI-powered content processing and classification
- **Responsibilities**:
  - Web scraping of story URLs
  - Geographic classification using neighborhood/municipality data
  - AI teaser generation with OpenAI
  - Content enhancement following voice guidelines

### 4. Data Models
- **Stories**: JSON-based storage with fields:
  - `id`: Unique identifier
  - `url`: Story URL
  - `umbrella`: Category/classification
  - `geographic_area`: Geographic region
  - `neighborhoods`: Associated neighborhoods (string or array)
  - `social_abstract`: AI-generated teaser
  - `title`, `author`, `date`: Metadata fields

## Frontend Components

### 1. App Component (`src/App.jsx`)
- **Purpose**: Root application component
- **Responsibilities**:
  - Authentication management
  - Data loading and state management
  - Route configuration
  - API communication

#### Data Loading Flow
```javascript
const loadData = async () => {
  try {
    // Try backend API first
    const response = await fetch('/api/refresh-data');
    if (response.ok) {
      const data = await response.json();
      setStories(data.stories);
      setFilters(data.filters);
    } else {
      // Fallback to local JSON
      setStories(storiesData.stories);
      setFilters(storiesData.filters);
    }
  } catch (error) {
    // Use local data if backend unavailable
  }
};
```

### 2. Dashboard Component (`src/components/Dashboard.jsx`)
- **Purpose**: Main interface for story browsing and management
- **Key Features**:
  - Story grid display
  - Search functionality
  - Filter integration
  - Statistics display
  - Upload integration

#### Filter State Management
```javascript
const [selectedFilters, setSelectedFilters] = useState({
  umbrella: [],           // Multi-select arrays
  geographic_area: [],
  neighborhood: []
});

// Advanced filtering logic with multi-value support
const filteredStories = useMemo(() => {
  return stories.filter(story => {
    // Complex matching logic for split values
    // Supports both exact matches and partial matches
    // Handles multiple separators: , ; / |
  });
}, [stories, searchTerm, selectedFilters]);
```

### 3. FilterPanel Component (`src/components/FilterPanel.jsx`)
- **Purpose**: Advanced multi-select filtering interface
- **Features**:
  - Collapsible filter sections
  - Checkbox-based multi-selection
  - Real-time filter count display
  - Individual filter removal
  - Clear all functionality

#### Filter Section Structure
```javascript
const renderFilterSection = (title, icon, filterType, options, color) => {
  // Expandable section with checkbox list
  // Shows selected count badge
  // Handles empty states
  // Color-coded by filter type
};
```

### 4. StoryCard Component (`src/components/StoryCard.jsx`)
- **Purpose**: Individual story display
- **Features**:
  - Story metadata display
  - Social abstract preview
  - External link handling
  - Geographic information display

### 5. UploadExcel Component (`src/components/UploadExcel.jsx`)
- **Purpose**: File upload interface
- **Features**:
  - Drag-and-drop upload
  - File validation
  - Progress feedback
  - Error handling
  - Success notifications

### 6. KeywordSearch Component (`src/components/KeywordSearch.jsx`)
- **Purpose**: Advanced search functionality
- **Features**:
  - Full-text search across stories
  - Search result highlighting
  - Filter integration

## Data Flow

### 1. Story Upload and Processing Flow
```
Excel File Upload
       ↓
File Validation & Storage
       ↓
Classification Pipeline
       ↓
├─ URL Extraction
├─ Web Scraping
├─ Geographic Classification
├─ AI Teaser Generation
└─ Duplicate Detection
       ↓
Data Merge & Filter Update
       ↓
JSON Storage Update
       ↓
Frontend Data Refresh
```

### 2. Filter Data Generation Flow
```
Raw Story Data
       ↓
Extract Field Values
       ↓
Split Multi-Value Entries
├─ Split by comma (,)
├─ Split by semicolon (;)
├─ Split by slash (/)
└─ Split by pipe (|)
       ↓
Remove Empty Values
       ↓
Deduplicate & Sort
       ↓
Generate Filter Options
```

### 3. Frontend Filtering Flow
```
User Filter Selection
       ↓
Update Filter State
       ↓
Trigger Story Re-filtering
       ↓
├─ Search Term Matching
├─ Multi-Value Field Matching
├─ Partial String Matching
└─ Array Intersection Logic
       ↓
Update Displayed Stories
```

## API Endpoints

### POST `/api/upload-excel`
- **Purpose**: Upload and process Excel/CSV files
- **Input**: Multipart form data with file
- **Process**:
  1. File validation and storage
  2. Classification pipeline execution
  3. Data processing and enhancement
  4. Duplicate detection
  5. Data merge and storage
- **Output**: Processing statistics and success status

### GET `/api/refresh-data`
- **Purpose**: Retrieve latest stories and filter data
- **Process**:
  1. Load existing stories from JSON
  2. Generate current filter options
  3. Return structured data
- **Output**: Stories array and filters object

## Database Schema

### Stories Data Structure
```json
{
  "stories": [
    {
      "id": 1,
      "url": "https://example.com/story",
      "umbrella": "Category1, Category2",
      "geographic_area": "Area1, Area2",
      "neighborhoods": "Neighborhood1, Neighborhood2",
      "social_abstract": "AI-generated teaser text",
      "title": "Story Title",
      "author": "Author Name",
      "date": "Publication Date"
    }
  ],
  "filters": {
    "umbrellas": ["Category1", "Category2"],
    "geographic_areas": ["Area1", "Area2"],
    "neighborhoods": ["Neighborhood1", "Neighborhood2"]
  }
}
```

## Filter System Implementation

### Backend Filter Generation
The filter system processes raw story data to extract unique filter options:

1. **Multi-Value Field Processing**:
   - Splits fields containing multiple values
   - Supports multiple separators: `,`, `;`, `/`, `|`
   - Removes empty strings and whitespace
   - Deduplicates values

2. **Filter Option Generation**:
   - Creates sorted arrays for each filter type
   - Maintains consistency across data updates
   - Handles both string and array input formats

### Frontend Filter Application
The frontend implements sophisticated filtering logic:

1. **Multi-Select Support**:
   - Checkbox-based selection interface
   - Array-based filter state management
   - Real-time filter count display

2. **Matching Logic**:
   - Supports exact and partial matches
   - Handles multi-value story fields
   - Uses array intersection for efficiency

3. **User Experience**:
   - Collapsible filter sections
   - Individual filter removal
   - Clear all functionality
   - Visual feedback with badges

## Dependencies

### Backend Dependencies
```
Flask==3.0.3              # Web framework
Flask-CORS==6.0.0          # Cross-origin resource sharing
Flask-SQLAlchemy==3.1.1    # Database ORM (future use)
pandas==2.2.3              # Data processing
openpyxl==3.1.5           # Excel file handling
beautifulsoup4==4.12.3     # Web scraping
requests==2.32.3           # HTTP requests
openai==1.97.0            # AI integration
pathlib                   # File path handling
hashlib                   # File hashing for duplicates
```

### Frontend Dependencies
```
React==18.3.1             # UI framework
React-Router-DOM==6.26.1  # Routing
Vite==5.4.1               # Build tool
Tailwind CSS==3.4.10     # Styling framework
Lucide React==0.436.0    # Icon library
```

### Development Dependencies
```
ESLint                    # Code linting
Prettier                  # Code formatting
PostCSS                   # CSS processing
Autoprefixer              # CSS vendor prefixes
```

## Deployment Architecture

### Local Development
```
Frontend (Vite Dev Server) :3000
       ↓
Backend (Flask) :5000
       ↓
Local File System
```

### Production Deployment
```
Frontend (Built Static Files)
       ↓
Flask Server (Serves Frontend + API)
       ↓
Persistent Storage
```

### File Structure
```
publicsource-integrated-dashboard/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── data/           # Local data files
│   │   └── hooks/          # Custom React hooks
│   ├── dist/               # Built frontend files
│   └── package.json        # Frontend dependencies
├── src/                     # Flask backend
│   ├── routes/             # API route handlers
│   ├── models/             # Data models (future)
│   └── main.py            # Application entry point
├── archive_classifier_final.py  # AI classification
├── requirements.txt         # Backend dependencies
└── README.md               # Project documentation
```

## Security Considerations

1. **File Upload Security**:
   - File type validation
   - Secure filename handling
   - Temporary file cleanup

2. **API Security**:
   - CORS configuration
   - Input validation
   - Error handling

3. **Authentication**:
   - Session-based authentication
   - Access code protection
   - Logout functionality

## Performance Optimizations

1. **Frontend**:
   - React.useMemo for expensive filtering
   - Component memoization
   - Lazy loading for large datasets

2. **Backend**:
   - Efficient file processing
   - Duplicate detection optimization
   - Temporary file cleanup

3. **Data Processing**:
   - Batch processing for uploads
   - Incremental filter updates
   - Memory-efficient data structures

## Future Enhancements

1. **Database Integration**:
   - Replace JSON storage with proper database
   - Add data persistence and backup

2. **Advanced Features**:
   - Real-time collaboration
   - Advanced analytics
   - Export functionality

3. **Performance**:
   - Caching layer
   - Background processing
   - API rate limiting

4. **User Experience**:
   - Advanced search features
   - Customizable dashboards
   - Mobile optimization


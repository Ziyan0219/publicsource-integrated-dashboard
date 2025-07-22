# PublicSource Integrated News Classification Dashboard

A comprehensive news classification system that combines frontend dashboard with backend processing capabilities for Excel file uploads and AI-powered content enhancement.

## Features

- **Interactive Dashboard**: React-based frontend with story management and analytics
- **Excel Upload**: Upload raw Excel files with automatic processing
- **AI Enhancement**: Automatic teaser generation using OpenAI with Social Media Voice Guidelines
- **Geographic Classification**: Automatic classification of stories by neighborhoods and geographic areas
- **Duplicate Detection**: Intelligent duplicate checking to avoid data redundancy
- **Real-time Updates**: Dynamic data refresh after uploads

## Architecture

### Frontend (`/frontend`)
- **Technology**: React + Vite + Tailwind CSS
- **Components**: Dashboard, Upload, Login, Story Cards, Filters
- **Features**: Responsive design, drag-and-drop upload, real-time feedback

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

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
```

### Run the Application
```bash
# Start the Flask server (serves both backend API and frontend)
source venv/bin/activate
python src/main.py
```

The application will be available at `http://localhost:5000`

## Usage

1. **Login**: Use access code `publicsource-cmu`
2. **Upload Excel**: Drag and drop or select Excel/CSV files
3. **Processing**: System automatically:
   - Extracts story URLs from Excel
   - Scrapes article content
   - Classifies geographic areas and neighborhoods
   - Generates social media teasers
   - Checks for duplicates
   - Updates the dashboard
4. **Browse**: Use filters and search to explore stories

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
├── src/                    # Flask backend
│   ├── main.py            # Main application entry
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   └── static/            # Built frontend files
├── frontend/              # React frontend source
│   ├── src/
│   │   ├── components/    # React components
│   │   └── data/          # JSON data files
│   └── dist/              # Built files
├── archive_classifier_final.py  # Classification algorithm
├── improved_teaser_generator.py # Enhanced teaser generation
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Deployment

The application is designed for easy deployment to cloud platforms. The Flask app serves both the API and the built frontend files.

## License

This project is developed for PublicSource news organization.


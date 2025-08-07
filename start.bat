@echo off
echo Starting PublicSource Dashboard...

echo.
echo [1/4] Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Copying build files...
cd ..
xcopy /E /Y frontend\dist\* src\static\ >nul

echo.
echo [3/4] Checking Python dependencies...
python -c "import flask, flask_cors, pandas, openai" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

echo.
echo [4/4] Starting Flask server...
echo Dashboard will be available at: http://localhost:5000
echo Access code: publicsource-cmu
echo.
python src/main.py
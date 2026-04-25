# RUN Classroom Attendance Monitoring System

## Overview
Replaces manual paper-based attendance with a QR code web system.

## How to Run

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
This runs the Flask API on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
This runs the Vite React app on `http://localhost:5173`.

### 3. Demo Credentials
Visit `http://localhost:5173` in your browser.
- **Student**: `student@run.edu.ng` / `student123`
- **Lecturer**: `lecturer@run.edu.ng` / `lecturer123`
- **Admin**: `admin@run.edu.ng` / `admin123`

# School Vaccination Portal
A full-stack web application to manage student vaccination drives, built with FASTAPI (backend) and React (frontend).

## Project Structure
```
project-root/
├── app/                 # FastAPI backend
│   └── main.py
├── frontend/            # React frontend
├── venv/                # Python virtual environment (local only)
├── requirements.txt     # Backend dependencies
└── README.md
```
## Backend Setup (FastAPI)
### 1. Prerequisites
- Python 3.8+
- [Virtualenv](https://pypi.org/project/virtualenv/)
- `pip` (Python package installer)

### 2. Install Dependencies
Create and activate a virtual environment (if not already active):

#### Create virtual environment (if not created yet)
python -m venv venv

#### Activate (Linux/Mac)
source venv/bin/activate

#### Activate (Windows)
venv\Scripts\activate

#### Install dependencies
pip install -r requirements.txt

### 3.Run the FastAPI Server
Start the development server using Uvicorn:

uvicorn app.main:app --reload

By default, the backend runs at:
http://127.0.0.1:8000

## Frontend Setup (React)
### 1. Prerequisites
Node.js (v16+ recommended)
npm (comes with Node.js)
### 2. Install Dependencies
cd frontend
npm install
### 3. Run the Frontend App
npm run dev

By default, the frontend runs at:
http://localhost:5173 or similar (check terminal output)

### Important Notes
The backend assumes it's running at http://127.0.0.1:8000, and certain features like report download are hardcoded to this URL.
For example:

const downloadWindow = window.open(
  `http://127.0.0.1:8000/reports/download/csv?vaccine_name=${vaccine}`, 
  "_blank"
);
If you deploy the backend elsewhere, update this URL in the frontend code accordingly.
The backend venv is not connected to the frontend. The frontend has its own node_modules inside the frontend/ folder. You do not need to activate the backend venv to run the frontend.

-- Update the axios to the URL you use in the backend :
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

#### Technologies Used:
Backend: Python, FastAPI, Uvicorn
Frontend: React, Mantine UI
Others: CSV export, RESTful APIs, modern dashboard UI

#### Author - Harshitha Palligunthala

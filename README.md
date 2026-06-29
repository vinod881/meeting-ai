# Meeting AI

A real-time meeting intelligence assistant built with Next.js (frontend) and FastAPI (backend).

## Project Structure

```text
meeting-ai/
├── backend/            # FastAPI Python Application
│   ├── venv/           # Python Virtual Environment
│   ├── main.py         # App entry point with REST and WebSockets
│   └── .env            # Backend specific API keys
├── frontend/           # Next.js TypeScript App Router with Tailwind CSS
│   ├── src/            # Next.js Source directory
│   ├── .env.local      # Frontend specific environment variables
│   └── package.json    # Frontend dependency definitions
├── .gitignore          # Git exclusion rules
├── .env                # Global configuration references
└── README.md           # Documentation
```

## Setup & Running Guide

### 1. Pre-requisites
Ensure you have the following installed:
* Python 3.10+ (Checked and installed)
* Node.js 18+ (Checked and installed)
* Git (Checked and installed)

### 2. Configure Environment Variables
You need to configure your API keys. Copy your API keys into the `.env` files:
* Place your **Gemini API key** (`GEMINI_API_KEY`) and **Groq API key** (`GROQ_API_KEY`) inside the root `.env`, `backend/.env`, and `frontend/.env.local`.

### 3. Run the Backend API
Navigate to the `backend` folder, activate the virtual environment, and start the development server using Uvicorn:

On Windows (PowerShell):
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

On Windows (Command Prompt) or Linux/macOS:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

The API will start at [http://localhost:8000](http://localhost:8000). You can verify it by opening it in your browser.

### 4. Run the Frontend App
Navigate to the `frontend` folder and run the Next.js development server:

```bash
cd frontend
npm run dev
```

The UI dashboard will start at [http://localhost:3000](http://localhost:3000). Open this address to access the workspace control center, test your WebSocket connection, and view configuration states!

## Day 1 Deliverables
* [x] Project workspace skeleton established.
* [x] Python Virtual Environment setup with FastAPI & Websockets installed.
* [x] Next.js frontend project scaffolded.
* [x] Git repository initialized in the root folder.
* [x] Environment files ready for key entries.

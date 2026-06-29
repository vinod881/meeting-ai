from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Meeting AI Backend", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Meeting AI Backend API is running",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "groq_configured": bool(os.getenv("GROQ_API_KEY"))
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected")
    try:
        while True:
            # Receive text or message from the client
            data = await websocket.receive_text()
            print(f"Received message: {data}")
            # Echo the message back (or run through AI model in the future)
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

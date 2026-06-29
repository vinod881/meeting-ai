"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<{
    status: string;
    message: string;
    gemini_configured: boolean;
    groq_configured: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  // Check backend health
  const checkBackend = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/");
      if (res.ok) {
        const data = await res.json();
        setBackendStatus(data);
      } else {
        setBackendStatus(null);
      }
    } catch (err) {
      setBackendStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackend();
    // Clean up WebSocket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Connect WebSocket
  const connectWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    setWsStatus("connecting");
    const ws = new WebSocket("ws://localhost:8000/ws");
    
    ws.onopen = () => {
      setWsStatus("connected");
      setMessages((prev) => [...prev, "System: Connected to WebSocket Server."]);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, `Server: ${event.data}`]);
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      setMessages((prev) => [...prev, "System: Disconnected from WebSocket Server."]);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setMessages((prev) => [...prev, "System: WebSocket connection error."]);
      setWsStatus("disconnected");
    };

    socketRef.current = ws;
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // Send message through WebSocket
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || wsStatus !== "connected") return;
    
    socketRef.current.send(inputMessage);
    setMessages((prev) => [...prev, `You: ${inputMessage}`]);
    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-extrabold text-white text-lg">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Meeting AI
              </h1>
              <p className="text-xs text-slate-400">Day 1 Workspace Skeleton</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={checkBackend}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium transition-all"
            >
              Refresh API Status
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Backend API:</span>
              {loading ? (
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              ) : backendStatus ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-500/30">
                  <span className="h-2 w-2 rounded-full bg-rose-400"></span> Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: App Status & Keys */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-200">System Integration</h2>
            <p className="text-xs text-slate-400 mt-1">Status of API integrations and setup configurations</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Gemini API Key Status */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Gemini API Key</span>
                {backendStatus?.gemini_configured ? (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                ) : (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/20">Missing</span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Required for core LLM features. Register at{" "}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                  Google AI Studio
                </a>{" "}
                and add to <code className="text-indigo-300 font-mono">.env</code>.
              </p>
            </div>

            {/* Groq API Key Status */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Groq API Key (Backup)</span>
                {backendStatus?.groq_configured ? (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">Configured</span>
                ) : (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/20">Missing</span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Used for backup processing and alternative inference. Register at{" "}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                  Groq Console
                </a>.
              </p>
            </div>

            {/* Local Server Configs */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-sm block mb-2">Configuration Details</span>
              <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
                <li>• Backend URI: http://localhost:8000</li>
                <li>• WebSocket URI: ws://localhost:8000/ws</li>
                <li>• Frontend URI: http://localhost:3000</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Column 2: Live WebSocket Testing Console */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <div>
              <h2 className="text-lg font-bold text-slate-200">WebSocket Console</h2>
              <p className="text-xs text-slate-400 mt-0.5">Test real-time message stream to backend API</p>
            </div>
            
            <div className="flex items-center gap-2">
              {wsStatus === "disconnected" && (
                <button
                  onClick={connectWebSocket}
                  disabled={!backendStatus}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-semibold transition-all shadow-md shadow-indigo-500/10"
                >
                  Connect WS
                </button>
              )}
              {wsStatus === "connecting" && (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-400 text-xs font-semibold animate-pulse"
                >
                  Connecting...
                </button>
              )}
              {wsStatus === "connected" && (
                <button
                  onClick={disconnectWebSocket}
                  className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold transition-all"
                >
                  Disconnect WS
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-2 font-mono text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic select-none">
                {backendStatus 
                  ? "Connect the WebSocket and send messages to view the transaction stream." 
                  : "Start the FastAPI backend server on port 8000 to enable WebSocket testing."
                }
              </div>
            ) : (
              messages.map((msg, i) => {
                let colorClass = "text-slate-300";
                if (msg.startsWith("System:")) colorClass = "text-amber-400/80";
                else if (msg.startsWith("Server:")) colorClass = "text-emerald-400";
                else if (msg.startsWith("You:")) colorClass = "text-indigo-400";
                
                return (
                  <div key={i} className={`py-1 px-1.5 rounded hover:bg-slate-900/50 ${colorClass}`}>
                    {msg}
                  </div>
                );
              })
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={wsStatus !== "connected"}
              placeholder={wsStatus === "connected" ? "Type a test message to echo..." : "WebSocket is disconnected"}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={wsStatus !== "connected" || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-sm font-semibold transition-all disabled:text-slate-500 shadow-lg shadow-indigo-500/10"
            >
              Send
            </button>
          </form>
        </section>

      </main>

      {/* Guide/Requirements Summary (Day 1 Complete Check) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-3">Startup Commands</h3>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div>
                <p className="text-slate-400 mb-1 font-semibold">1. Start FastAPI Backend</p>
                <code className="text-indigo-400">cd backend; .\venv\Scripts\activate; uvicorn main:app --reload</code>
              </div>
              <div>
                <p className="text-slate-400 mb-1 font-semibold">2. Start Next.js Frontend</p>
                <code className="text-indigo-400">cd frontend; npm run dev</code>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-3">Day 1 Deliverables Checklist</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Create project structure (backend/ and frontend/)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Python virtual environment configured
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> FastAPI, Websockets, Uvicorn, Python-multipart installed
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Next.js frontend with Tailwind & TS scaffolded
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">⚡</span> Setup local <code className="text-indigo-300">.env</code> keys (Add your Gemini + Groq keys)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400">⚡</span> Initialize Git / Create GitHub repository and push
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

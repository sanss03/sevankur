import 'regenerator-runtime/runtime';
import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import ChatMessage from './ChatMessage';
import Loader from './Loader';
import { sendMessage } from '../services/chatService';
import ConnectionStatus from './ConnectionStatus';

const STORAGE_KEY = "sevankur_chat_history";

export default function ChatBox({ t, lang = 'en', dark, setDark }) {
  const [messages, setMessages] = useState([
    { id: Date.now(), sender: "bot", content: t.greeting, type: "greeting", timestamp: new Date(), reactions: [] }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasHistory, setHasHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [lastData, setLastData] = useState(null);
  
  const endRef = useRef(null);
  const wasListeningRef = useRef(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Sync transcript to input while listening
  useEffect(() => {
    if (transcript) {
      setCurrentInput(transcript);
    }
  }, [transcript]);

  // Handle auto-submit when listening stops
  useEffect(() => {
    if (wasListeningRef.current && !listening && transcript.trim()) {
      handleSendMessage(transcript.trim());
      resetTranscript();
    }
    wasListeningRef.current = listening;
  }, [listening, transcript]);

  // Sync with LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1) setHasHistory(true);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].sender !== "bot")) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
      setHasHistory(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Delete all messages?")) {
      setMessages([{ id: Date.now(), sender: "bot", content: t.greeting, type: "greeting", timestamp: new Date(), reactions: [] }]);
      localStorage.removeItem(STORAGE_KEY);
      setHasHistory(false);
    }
  };

  const handleSendMessage = async (msgOverride = null) => {
    const textToSend = msgOverride !== null ? msgOverride : currentInput;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    const timestamp = new Date();

    setError("");
    const userMsg = { id: Date.now(), sender: "user", text: userMessage, timestamp, reactions: [] };
    setMessages(prev => [...prev, userMsg]);
    
    setCurrentInput("");
    setIsLoading(true);

    try {
      const res = await sendMessage(userMessage);
      if (res.data && res.data.length > 0) setLastData(res.data);

      const botMsg = { 
        id: Date.now(), 
        sender: "bot", 
        text: res.text || "No response",
        timestamp: new Date(), 
        reactions: [],
        data: res.data 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError("AI service unavailable.");
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: "bot", 
        text: "Error processing request", 
        timestamp: new Date(), 
        reactions: [] 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    if (!isMicrophoneAvailable) {
      setError("Microphone not available or permisson denied.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
      };
      SpeechRecognition.startListening({ 
        language: langMap[lang] || 'en-IN',
        continuous: true 
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/download-report', { method: 'POST' });
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Ward_4_Defaulter_Report.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  const filteredMessages = messages.filter(m => 
    (m.text || m.content)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ 
      height: "100%", display: "flex", flexDirection: "column", 
      background: "var(--card)", borderRadius: "16px", 
      border: "1px solid var(--border)", overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
    }}>
      <div style={{ padding: "14px 20px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 10px var(--success)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: "0.05em" }}>AI ASSISTANT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{dark ? '☀️' : '🌙'}</button>
          <ConnectionStatus />
        </div>
      </div>

      <div style={{ padding: "8px 20px", background: "var(--bg)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input 
          type="text" placeholder="Search messages..." 
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: "5px 12px", fontSize: 12, borderRadius: 6, maxWidth: 200 }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {lastData && (
            <button onClick={exportToPDF} style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Download Report</button>
          )}
          <button onClick={() => setFontSize(Math.min(fontSize + 2, 24))} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>A+</button>
          <button onClick={() => setFontSize(Math.max(fontSize - 2, 10))} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>A-</button>
          <button onClick={clearChat} style={{ border: "1.5px solid #ef4444", color: "#ef4444", background: "none", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>Clear</button>
        </div>
      </div>

      {hasHistory && (
        <div style={{ background: "var(--primary-ll)", padding: "10px 20px", borderBottom: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 500 }}>Previous history found.</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={loadHistory} style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Load History</button>
            <button onClick={() => setHasHistory(false)} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: "11px", cursor: "pointer" }}>Ignore</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 20px", fontSize: "12px", fontWeight: 500, borderBottom: "1px solid #fecaca" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.filter(m => (m.text || m.content)?.toLowerCase().includes(searchQuery.toLowerCase())).map((msg) => (
          <ChatMessage key={msg.id} msg={msg} t={t} fontSize={fontSize} setMessages={setMessages} />
        ))}
        {isLoading && (
          <div style={{ alignSelf: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, marginLeft: 44, animation: "pulse 1.5s infinite" }}>Sevankur is processing...</div>
            <Loader type="dots" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "16px 20px", background: "var(--card)", borderTop: "1px solid var(--border)", display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: 1, background: "var(--bg2)", borderRadius: "12px", padding: "8px 16px", border: "1.5px solid var(--border)", display: "flex", alignItems: "center" }}>
          <textarea
            value={currentInput} rows={1}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={listening ? "Listening... (Click button to stop)" : (t.placeholder || "Type here...")}
            style={{ 
              flex: 1, resize: "none", border: "none", background: "transparent", 
              fontSize: 14, outline: "none", color: "var(--text)",
              fontFamily: "'DM Sans', sans-serif" 
            }}
          />
        </div>
        
        <button 
          onClick={startVoiceInput}
          style={{ 
            background: listening ? "#ef4444" : "var(--bg2)", 
            border: "1.5px solid var(--border)", borderRadius: "20px", padding: "0 16px", height: "42px", 
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", 
            color: listening ? "#fff" : "var(--text)",
            boxShadow: listening ? `0 0 10px rgba(239,68,68,0.4)` : "none",
            transition: "all 0.2s"
          }}
        >
          {listening ? "🔴 Stop" : "🎤 Speak"}
        </button>

        <button 
          onClick={() => handleSendMessage()} 
          disabled={!currentInput.trim() || isLoading}
          style={{ 
            background: currentInput.trim() && !isLoading ? "var(--primary)" : "var(--border)", 
            border: "none", borderRadius: "50%", width: "45px", height: "45px", 
            cursor: "pointer", color: "#fff", fontSize: "20px", transition: "all .2s"
          }}
        >
          {isLoading ? "..." : "↑"}
        </button>
      </div>
    </div>
  );
}

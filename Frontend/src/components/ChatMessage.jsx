import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Table from './Table';
import Chart from './Chart';

const formatRelativeTime = (date) => {
  if (!date) return "just now";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
};

export default function ChatMessage({ msg, t, fontSize, setMessages }) {
  const isUser = msg.sender === "user";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(msg.text || msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Special greeting style
  if (msg.type === "greeting") return (
    <div style={{ display: "flex", gap: 12, marginBottom: 8, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#475569", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: 13, fontWeight: 600 }}>S</div>
      <div style={{ flex: 1 }}>
        <div className="markdown-body" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "0 16px 16px 16px", padding: "14px 18px", fontSize: fontSize, lineHeight: 1.6, color: "#1e293b", maxWidth: "85%" }}>
          {t.greeting}
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, marginLeft: 2, textTransform: "uppercase", letterSpacing: "0.03em" }}>AI ASSISTANT • {formatRelativeTime(msg.timestamp)}</div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: "flex", gap: 10, marginBottom: 4, 
      flexDirection: isUser ? "row-reverse" : "row", 
      animation: "fadeUp 0.3s ease both",
      alignItems: "flex-end"
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: isUser ? "#2563eb" : "#475569",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#fff", fontSize: 12, fontWeight: 700,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        transform: "translateY(-4px)"
      }}>{isUser ? "U" : "S"}</div>
      
      <div style={{ 
        flex: 1, 
        maxWidth: "80%", 
        display: "flex", 
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start" 
      }}>
        <div style={{ position: "relative", group: "true", width: "100%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
          <div className="markdown-body" style={{
            background: isUser ? "#2563eb" : "#f1f5f9",
            border: isUser ? "none" : "1px solid #e2e8f0",
            borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
            padding: "12px 18px", fontSize: fontSize, lineHeight: 1.6,
            color: isUser ? "#fff" : "#1e293b",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            wordBreak: "break-word",
            width: "fit-content"
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.text || msg.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {msg.data && <Table data={msg.data} />}
        {msg.chart && <Chart data={msg.chart} />}
        {msg.sql && (
          <div style={{ marginTop: 10, background: "var(--bg2)", borderRadius: 10, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: "var(--text2)", border: "1px solid var(--border)", width: "100%" }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>SQL generated:</div>
            {msg.sql}
          </div>
        )}
        
        <div style={{ 
          fontSize: 10, color: "#94a3b8", marginTop: 6, 
          textAlign: isUser ? "right" : "left",
          textTransform: "uppercase", letterSpacing: "0.03em"
        }}>
          {isUser ? "You" : "AI ASSISTANT"} • {formatRelativeTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

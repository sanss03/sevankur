import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/apiConfig';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const lastCheckedStr = lastCheck 
    ? lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : "Never";

  return (
    <div 
      title={`Last health check: ${lastCheckedStr}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: isConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
        padding: "4px 10px",
        borderRadius: "20px",
        border: `1px solid ${isConnected ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
        transition: "all 0.4s ease",
        cursor: "help"
      }}
    >
      <div style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: isConnected ? "#22c55e" : "#ef4444",
        boxShadow: `0 0 10px ${isConnected ? "#22c55e80" : "#ef444480"}`,
        animation: isConnected ? "pulse 2.5s infinite" : "none"
      }} />
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color: isConnected ? "#166534" : "#991b1b",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

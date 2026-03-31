import React, { useState, useEffect } from 'react';
import { NOTIFY_EVENT } from '../services/notificationService';

const COLORS = {
  success: { bg: "#ecfdf5", border: "#10b981", icon: "✅", text: "#065f46" },
  error: { bg: "#fef2f2", border: "#ef4444", icon: "❌", text: "#991b1b" },
  warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠️", text: "#92400e" },
  info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️", text: "#1e40af" }
};

export default function NotificationContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotify = (e) => {
      const { message, type, duration, id } = e.detail;
      const newToast = { id, message, type, duration };
      
      setToasts(prev => [...prev, newToast]);

      // Automatic removal after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    window.addEventListener(NOTIFY_EVENT, handleNotify);
    return () => window.removeEventListener(NOTIFY_EVENT, handleNotify);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 20, right: 20,
      zIndex: 9999, display: "flex", flexDirection: "column",
      gap: 12, pointerEvents: "none", width: "100%", maxWidth: 320
    }}>
      {toasts.map(t => {
        const style = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} style={{
            background: style.bg, border: `1.5px solid ${style.border}`,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            padding: "12px 16px", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 12,
            animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
            pointerEvents: "auto", cursor: "pointer"
          }} onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}>
            <span style={{ fontSize: 16 }}>{style.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: style.text, lineHeight: 1.4 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import Shield from './Shield';

export default function Sidebar({ user, t, onLogout, isAdmin }) {
  const navItems = [
    { id: "chat", path: "/chat", icon: "💬", label: t.chat },
    { id: "dashboard", path: "/dashboard", icon: "📊", label: t.dashboard },
    { id: "defaulters", path: "/defaulters", icon: "⚠️", label: t.defaulters, badge: 47 },
    { id: "reports", path: "/reports", icon: "📋", label: t.reports },
    { id: "tax-calculator", path: "/tax-calculator", icon: "🧮", label: t.taxCalculator },
    ...(isAdmin ? [{ id: "settings", path: "/settings", icon: "⚙️", label: "Settings" }] : []),
  ];

  return (
    <div style={{
      width: "var(--sidebar-w)", background: "var(--gradient)",
      color: "#FFFFFF",
      display: "flex", flexDirection: "column", flexShrink: 0,
      transition: "background .3s",
      zIndex: 10,
    }}>
      <div style={{ padding: "20px 18px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)", overflow: "hidden", flexShrink: 0 }}>
            <img src="/site_logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, letterSpacing: "0.02em" }}>Sevankur</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", fontWeight: 600 }}>{isAdmin ? "ADMINISTRATOR" : "OFFICER"}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10, padding: "10px 14px",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Logged in as</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>{user?.name || "Officer"}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{user?.empId}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {navItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            style={({ isActive }) => ({
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.72)",
              fontSize: 14, fontFamily: "'DM Sans',sans-serif",
              fontWeight: isActive ? 600 : 400, marginBottom: 4,
              transition: "all .2s", textAlign: "left",
              textDecoration: "none",
              border: isActive ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 18, filter: isActive ? "none" : "grayscale(0.5) opacity(0.8)" }}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span style={{ marginLeft: "auto", background: "#FF4D4D", color: "#fff", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <button onClick={onLogout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)", fontSize: 14,
          fontFamily: "'DM Sans',sans-serif", textAlign: "left", fontWeight: 500,
          transition: "all .2s"
        }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}

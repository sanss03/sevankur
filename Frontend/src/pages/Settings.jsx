import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Settings() {
  const { t, isAdmin } = useOutletContext();

  return (
    <div style={{ animation: "fadeUp .4s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600 }}>
          Settings
        </h2>
        <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>
          Application preferences and user profile
        </p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Profile Information</div>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ padding: "12px", background: "var(--bg2)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 4 }}>Name</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{isAdmin ? "Admin User" : "Officer Patil"}</span>
          </div>
          <div style={{ padding: "12px", background: "var(--bg2)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 4 }}>Email</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {isAdmin ? "admin@sevankur.com" : "officer@sevankur.com"}
            </span>
          </div>
          <div style={{ padding: "12px", background: "var(--bg2)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text3)", display: "block", marginBottom: 4 }}>Role</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {isAdmin ? "System Administrator" : "Municipal Officer"}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 24, marginBottom: 16 }}>Preferences</div>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>Language Preference</span>
            <select style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)" }}>
              <option>English</option>
              <option>Marathi (मराठी)</option>
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>Theme</span>
            <select style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)" }}>
              <option>Light Theme</option>
              <option>Dark Theme</option>
            </select>
          </div>
        </div>

        <button className="btn-primary" style={{ marginTop: 24, width: "100%" }}>Save Preferences</button>
      </div>
    </div>
  );
}

import React from 'react';

export default function Loader({ type = "dots" }) {
  if (type === "spinner") {
    return (
      <span style={{ 
        width: 15, height: 15, 
        border: "2px solid rgba(255,255,255,0.4)", 
        borderTopColor: "#fff", 
        borderRadius: "50%", 
        animation: "spin .8s linear infinite", 
        display: "inline-block" 
      }} />
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>S</div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px 14px 14px 14px", padding: "14px 20px", display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", animation: `chatTyp 1.2s ease ${d}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

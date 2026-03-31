import React from 'react';

export default function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="card a-fadeUp" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: color, opacity: .1 }} />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: "'Playfair Display',serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

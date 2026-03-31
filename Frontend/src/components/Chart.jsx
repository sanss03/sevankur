import React from 'react';

export default function Chart({ data }) {
  if (!data) return null;
  return (
    <div style={{ marginTop: 12 }}>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>
            <span>{d.ward}</span><span>{d.collected}%</span>
          </div>
          <div style={{ height: 8, background: "var(--bg2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, transition: "width 1s ease",
              width: `${d.collected}%`,
              background: d.collected >= 80 ? "var(--success)" : d.collected >= 60 ? "var(--accent)" : "var(--danger)"
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

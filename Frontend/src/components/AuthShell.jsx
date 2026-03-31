import React from 'react';
import FloatParticles from './FloatParticles';
import Shield from './Shield';

export default function AuthShell({ dark, setDark, lang, setLang, t, right }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <div style={{
        flex: "0 0 50%", background: "var(--gradient)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "60px 48px",
        position: "relative", overflow: "hidden",
      }}>
        <FloatParticles color="rgba(255,255,255,0.15)" />
        {[["-80px", "-80px", "280px"], ["auto", "-60px", "auto", "200px", "-60px"]].map((_, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
            width: 240 - i * 40, height: 240 - i * 40,
            top: i === 0 ? "-80px" : "auto", right: i === 0 ? "-80px" : "auto",
            bottom: i === 1 ? "-60px" : "auto", left: i === 1 ? "-60px" : "auto",
            pointerEvents: "none",
          }} />
        ))}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 }}>
          <div className="a-scaleIn" style={{
            width: 80, height: 80, borderRadius: "24px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            backdropFilter: "blur(10px)",
          }}>
            <div className="a-float" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "50%", background: "#FFFFFF", padding: "6px" }}>
              <img src="/site_logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
          <h1 className="a-blurIn a-glow" style={{
            fontFamily: "'Playfair Display',serif", fontSize: 50, fontWeight: 700,
            color: "#fff", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 14,
          }}>Sevankur</h1>
          <p className="a-blurIn1" style={{
            color: "rgba(255,255,255,0.72)", fontSize: 13, letterSpacing: "0.09em",
            textTransform: "uppercase", fontWeight: 300, marginBottom: 44,
          }}>{t.tagline}</p>
          {[
            { icon: "🏛", text: "Municipal Data Management" },
            { icon: "🤖", text: "AI-Powered Query System" },
            { icon: "📊", text: "Real-time Analytics & Reports" },
          ].map((f, i) => (
            <div key={i} className={`a-fadeUp${i + 2}`} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 10, padding: "11px 18px", marginBottom: 8, textAlign: "left",
            }}>
              <span style={{ fontSize: 17 }}>{f.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 13 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        flex: "0 0 50%", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 52px", position: "relative",
      }}>
        <div style={{ position: "absolute", top: 18, right: 18, display: "flex", gap: 8 }}>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{ fontSize: 12, padding: "5px 8px", width: "auto", color: "var(--text2)" }}>
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="mr">मर</option>
          </select>
          <button onClick={() => setDark(!dark)} style={{
            width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
            background: "transparent", cursor: "pointer", fontSize: 15,
          }}>{dark ? "☀️" : "🌙"}</button>
        </div>
        {right}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shield from '../components/Shield';
import FloatParticles from '../components/FloatParticles';
import { useTyping } from '../hooks/useTyping';

export default function Intro() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();
  const tagline = "Smart Governance Made Simple";
  const typed = useTyping(tagline, { delay: 0, speed: 46, active: phase >= 2 });

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(() => navigate('/login'), 3800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", background: "var(--gradient)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", position: "relative", overflow: "hidden",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
      }} />

      <FloatParticles color="rgba(255,255,255,0.2)" />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        transformOrigin: "center",
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3) 40%,rgba(255,255,255,0.3) 60%,transparent)",
        animation: "topLine 1.2s ease both",
      }} />

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: 1, textAlign: "center", padding: "0 24px",
      }}>
        {phase >= 0 && (
          <div style={{
            width: 80, height: 80, borderRadius: "24px",
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 30, animation: "scaleIn .7s cubic-bezier(.34,1.56,.64,1) both",
            backdropFilter: "blur(10px)",
          }}>
            <div className="a-float" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "50%", background: "#FFFFFF", padding: "6px" }}>
              <img src="/site_logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        )}

        {phase >= 1 && (
          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(56px,10vw,88px)", fontWeight: 700,
            color: "#FFFFFF", letterSpacing: "0.02em", lineHeight: 1,
            marginBottom: 20, userSelect: "none",
            animation: "blurIn .9s cubic-bezier(.22,1,.36,1) both",
            textShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>Sevankur</h1>
        )}

        {phase >= 2 && (
          <div style={{
            width: 48, height: 1, background: "rgba(255,255,255,0.3)", marginBottom: 20,
            animation: "topLine .5s ease both", transformOrigin: "center",
          }} />
        )}

        {phase >= 2 && (
          <p style={{
            fontSize: "clamp(14px,2vw,17px)", color: "rgba(255,255,255,0.8)",
            fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase",
            minHeight: "1.4em", userSelect: "none",
            animation: "fadeUp .5s ease both",
          }}>
            {typed}
            <span style={{
              display: "inline-block", width: 2, height: "1.1em",
              background: "#FFFFFF", marginLeft: 4, verticalAlign: "middle",
              animation: "cursor .6s step-end infinite",
            }} />
          </p>
        )}

        {phase >= 3 && (
          <div style={{
            marginTop: 48, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 30, padding: "8px 20px",
            animation: "fadeUp .5s ease .3s both",
            backdropFilter: "blur(5px)",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#4bab60",
              animation: "pulse 1.6s infinite",
              boxShadow: "0 0 10px #4bab60",
            }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", fontWeight: 500 }}>
              AI-Powered Municipal Platform
            </span>
          </div>
        )}
      </div>

      {phase >= 3 && (
        <div style={{
          position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
          width: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          animation: "fadeIn .4s ease .2s both",
        }}>
          <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#4bab60", borderRadius: 3,
              animation: "progFill 2.5s linear both",
              boxShadow: "0 0 10px rgba(75,171,96,0.5)",
            }} />
          </div>
          <p style={{
            fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em",
            textTransform: "uppercase", animation: "pulse 1.8s infinite",
            fontWeight: 600,
          }}>Loading…</p>
        </div>
      )}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        transformOrigin: "center",
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3) 40%,rgba(255,255,255,0.3) 60%,transparent)",
        animation: "topLine 1.2s ease both",
      }} />
    </div>
  );
}

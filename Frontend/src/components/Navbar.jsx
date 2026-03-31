import React, { useState, useEffect } from 'react';
import Shield from './Shield';
import { NOTIFS, ACTIVITY } from '../utils/constants';

export default function Navbar({ 
  user, ward, setWard, zone, setZone, 
  lang, setLang, dark, setDark, t,
  isAdmin, online, aiActive, search, setSearch 
}) {
  const [showNotif, setShowNotif] = useState(false);
  const [showAct, setShowAct] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let timer;
    if (search && search.trim().length >= 1) {
      setSearching(true);
      timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/properties/search?query=${encodeURIComponent(search)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setResults(data.data);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    } else {
      setResults([]);
      setSearching(false);
    }
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{
      height: "var(--nav-h)", background: "var(--card)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0,
    }}>
      {/* Ward Dropdown Removed */}
      {/* Zone Dropdown Removed */}

      <div style={{ flex: 1, position: "relative", maxWidth: 340 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, zIndex: 110 }}>{searching ? "⏳" : "🔍"}</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t.searchProp || "Search property or owner..."}
          style={{ paddingLeft: 36, paddingTop: 7, paddingBottom: 7, fontSize: 13, width: "100%", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }} />
        
        {search.trim().length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0,
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            zIndex: 1000, overflow: "hidden", animation: "fadeUp 0.2s ease"
          }}>
            {results.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                      <th style={{ padding: "8px 12px", color: "var(--text2)" }}>Owner</th>
                      <th style={{ padding: "8px 12px", color: "var(--text2)" }}>Property ID</th>
                      <th style={{ padding: "8px 12px", color: "var(--text2)" }}>Ward</th>
                      <th style={{ padding: "8px 12px", color: "var(--text2)" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(prop => (
                      <tr key={prop.propertyId} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>{prop.ownerName}</td>
                        <td style={{ padding: "10px 12px", color: "var(--text3)" }}>{prop.propertyId}</td>
                        <td style={{ padding: "10px 12px" }}>Ward {prop.ward}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ 
                            padding: "2px 8px", borderRadius: 12, fontSize: 10,
                            background: prop.status === "active" ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)",
                            color: prop.status === "active" ? "var(--success)" : "var(--danger)",
                            fontWeight: 600
                          }}>
                            {prop.status === "active" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
                {searching ? "Searching database..." : "No matching property found"}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: online ? "rgba(39,174,96,0.09)" : "rgba(192,57,43,0.09)",
          border: `1px solid ${online ? "var(--success)" : "var(--danger)"}`,
          borderRadius: 20, padding: "4px 10px", fontSize: 11,
          color: online ? "var(--success)" : "var(--danger)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }} />
          {online ? t.systemOnline : t.offline}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(36,113,163,0.09)", border: "1px solid var(--info)",
          borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "var(--info)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulse 1.5s infinite" }} />
          {t.aiActive}
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowNotif(!showNotif); setShowAct(false); }} style={{
            width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
            background: showNotif ? "var(--primary-ll)" : "transparent",
            cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            🔔
            <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", border: "2px solid var(--card)" }} />
          </button>
          {showNotif && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 310,
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 16, zIndex: 200,
              animation: "fadeUp .2s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{t.notifications}</div>
              {NOTIFS.map(n => (
                <div key={n.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 16 }}>{n.type === "warning" ? "⚠️" : n.type === "alert" ? "🚨" : n.type === "success" ? "✅" : "ℹ️"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{n.msg}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => { setShowAct(!showAct); setShowNotif(false); }} style={{
            width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
            background: showAct ? "var(--primary-ll)" : "transparent",
            cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
          }}>📜</button>
          {showAct && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 310,
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: 16, zIndex: 200,
              animation: "fadeUp .2s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{t.activityLog}</div>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", paddingTop: 2 }}>{a.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12 }}>{a.action}</div>
                    <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 1 }}>{a.user}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select value={lang} onChange={e => setLang(e.target.value)} style={{
          fontSize: 12, padding: "5px 8px", border: "1px solid var(--border)",
          borderRadius: 8, background: "var(--card)", color: "var(--text2)", cursor: "pointer", width: "auto",
        }}>
          <option value="en">EN</option>
          <option value="hi">हि</option>
          <option value="mr">मर</option>
        </select>

        <button onClick={() => setDark(!dark)} style={{
          width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
          background: "transparent", cursor: "pointer", fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </div>
  );
}

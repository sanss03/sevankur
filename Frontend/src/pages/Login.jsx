import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Loader from '../components/Loader';

export default function Login({ onLogin, dark, setDark, lang, setLang, t }) {
  const [form, setForm] = useState({ empId: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault();
    if (!form.empId || !form.password) { setError("Please fill Employee ID and Password."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: "Admin Officer", empId: form.empId, role: "admin", email: form.email });
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <AuthShell dark={dark} setDark={setDark} lang={lang} setLang={setLang} t={t} right={
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="a-fadeUp" style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 27, fontWeight: 600, marginBottom: 6 }}>{t.login}</h2>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>{t.welcome}</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "empId", label: t.empId, type: "text", ph: "MCG-2024-0042", cls: "a-fadeUp1" },
            { key: "email", label: t.email, type: "email", ph: "officer@gov.in", cls: "a-fadeUp2" },
            { key: "password", label: t.password, type: "password", ph: "••••••••", cls: "a-fadeUp3" },
          ].map(f => (
            <div key={f.key} className={f.cls}>
              <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}

          {error && (
            <p style={{
              fontSize: 12, color: "#C0392B", background: "#FFEBEE",
              border: "1px solid #FFCDD2", borderRadius: 6, padding: "8px 12px"
            }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary a-fadeUp4"
            style={{ padding: "12px", fontSize: 15, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading
              ? <><Loader type="spinner" /> Processing…</>
              : t.login}
          </button>
        </form>

        <p className="a-fadeUp5" style={{ textAlign: "center", fontSize: 13, color: "var(--text2)", marginTop: 20 }}>
          {t.noAccount}{" "}
          <Link to="/signup" style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
            {t.signup}
          </Link>
        </p>
      </div>
    } />
  );
}

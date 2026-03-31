import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Loader from '../components/Loader';

export default function Signup({ onLogin, dark, setDark, lang, setLang, t }) {
  const [form, setForm] = useState({ name: "", empId: "", role: "officer", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: form.name || "New Officer", empId: form.empId, role: form.role, email: form.email });
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <AuthShell dark={dark} setDark={setDark} lang={lang} setLang={setLang} t={t} right={
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div className="a-fadeUp" style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 27, fontWeight: 600, marginBottom: 6 }}>{t.signup}</h2>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>{t.createAcc}</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "name", label: t.name, type: "text", ph: "Ramesh Kumar Sharma", cls: "a-fadeUp1" },
            { key: "empId", label: t.empId, type: "text", ph: "MCG-2024-0042", cls: "a-fadeUp2" },
            { key: "email", label: t.email, type: "email", ph: "officer@gov.in", cls: "a-fadeUp3" },
            { key: "password", label: t.password, type: "password", ph: "••••••••", cls: "a-fadeUp4" },
          ].map(f => (
            <div key={f.key} className={f.cls}>
              <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}

          <div className="a-fadeUp3">
            <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6 }}>{t.role}</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="officer">{t.officer}</option>
              <option value="admin">{t.admin}</option>
            </select>
          </div>

          <button type="submit" className="btn-primary a-fadeUp5"
            style={{ padding: "12px", fontSize: 15, marginTop: 6, display: "flex", alignItems: "center", justifyCenter: "center", gap: 8, justifyContent: "center" }}>
            {loading
              ? <><Loader type="spinner" /> Processing…</>
              : t.signup}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text2)", marginTop: 20 }}>
          {t.hasAccount}{" "}
          <Link to="/login" style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
            {t.login}
          </Link>
        </p>
      </div>
    } />
  );
}

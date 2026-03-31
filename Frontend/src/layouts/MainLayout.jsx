import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout({ user, onLogout, lang, setLang, dark, setDark, t }) {
  const [ward, setWard] = useState("5");
  const [zone, setZone] = useState("A");
  const [search, setSearch] = useState("");

  if (!user) return <Navigate to="/login" />;

  const isAdmin = user.role === "admin";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar user={user} t={t} onLogout={onLogout} isAdmin={isAdmin} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Navbar 
          user={user} ward={ward} setWard={setWard} zone={zone} setZone={setZone}
          lang={lang} setLang={setLang} dark={dark} setDark={setDark} t={t}
          isAdmin={isAdmin} online={true} aiActive={true} search={search} setSearch={setSearch}
        />
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <Outlet context={{ ward, zone, isAdmin, t, lang }} />
        </div>
      </div>
    </div>
  );
}

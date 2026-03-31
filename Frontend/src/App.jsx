import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Defaulters from './pages/Defaulters';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TaxCalculator from './pages/TaxCalculator';
import NotificationContainer from './components/NotificationContainer';
import { T } from './utils/constants';

function App() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");

  const t = T[lang];

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <NotificationContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={
            <Login 
              onLogin={handleLogin} 
              dark={dark} setDark={setDark} 
              lang={lang} setLang={setLang} 
              t={t} 
            />
          } />
          <Route path="/signup" element={
            <Signup 
              onLogin={handleLogin} 
              dark={dark} setDark={setDark} 
              lang={lang} setLang={setLang} 
              t={t} 
            />
          } />
          <Route element={
            <MainLayout 
              user={user} 
              onLogout={handleLogout} 
              lang={lang} setLang={setLang} 
              dark={dark} setDark={setDark} 
              t={t} 
            />
          }>
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/defaulters" element={<Defaulters />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/tax-calculator" element={<TaxCalculator />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect /app to /chat as per request */}
            <Route path="/app" element={<Navigate to="/chat" replace />} />
          </Route>
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

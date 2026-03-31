import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

export default function Chat() {
  const { t, lang } = useOutletContext();

  return (
    <div style={{ height: "calc(100vh - var(--nav-h) - 40px)", display: "flex", flexDirection: "column" }}>
      <ChatBox t={t} lang={lang} />
    </div>
  );
}

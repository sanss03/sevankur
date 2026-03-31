import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendUserMessage, getServerStatus } from '../services/chatService';
import { generateAIResponse } from '../services/aiService';
import { getUserProfile } from '../services/userService';
import { getChatHistory, saveMessage } from '../services/historyService';

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiModel, setAiModel] = useState("gemini-pro");
  const [status, setStatus] = useState({ connected: false, lastChecked: null, uptime: "0s" });

  // Health Monitoring
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getServerStatus();
        setIsConnected(true);
        setStatus({
          connected: true,
          lastChecked: new Date(),
          uptime: res.uptime || "N/A"
        });
      } catch (e) {
        setIsConnected(false);
        setStatus(prev => ({ ...prev, connected: false, lastChecked: new Date() }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const wrapRequest = async (fn, isAI = false) => {
    if (isAI) setIsGeneratingAI(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (e) {
      setError(e.message || "An unexpected error occurred.");
      throw e;
    } finally {
      if (isAI) setIsGeneratingAI(false);
      else setIsLoading(false);
    }
  };

  const value = {
    isConnected,
    isLoading,
    error,
    isGeneratingAI,
    aiModel,
    connectionStatus: status,
    functions: {
      sendUserMessage: (msg) => wrapRequest(() => sendUserMessage(msg)),
      generateAIResponse: (msg, history) => wrapRequest(() => generateAIResponse(msg, history), true),
      getUserProfile: () => wrapRequest(() => getUserProfile()),
      getChatHistory: () => wrapRequest(() => getChatHistory()),
      saveMessage: (sender, text) => wrapRequest(() => saveMessage(sender, text)),
      clearError: () => setError(null),
      setAIModel: (model) => setAiModel(model)
    }
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw new Error("useApi must be used within an ApiProvider");
  return context;
}

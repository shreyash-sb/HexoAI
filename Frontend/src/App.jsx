import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from "uuid";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

function App() {
  const [prompt, setPrompt] = useState("");
  const [currThreadId, setCurrThreadId] = useState(uuidv4());
  const [prevChats, setPrevChats] = useState([]);
  const [allThreads, setAllThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  // Fetch thread list
  const fetchAllThreads = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/thread`);
      if (response.ok) {
        const data = await response.json();
        setAllThreads(data);
      }
    } catch (err) {
      console.warn("Could not connect to HexoAI backend:", err.message);
    }
  }, []);

  // Fetch backend status
  const fetchBackendStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setBackendStatus(data);
      }
    } catch (err) {
      setBackendStatus({ database: "connecting", geminiConfigured: false });
    }
  }, []);

  useEffect(() => {
    fetchAllThreads();
    fetchBackendStatus();
  }, [fetchAllThreads, fetchBackendStatus]);

  // Create a brand new chat session
  const createNewChat = () => {
    setCurrThreadId(uuidv4());
    setPrevChats([]);
    setPrompt("");
    setErrorMsg(null);
    setSidebarOpen(false);
  };

  // Switch to an existing thread
  const changeThread = async (threadId) => {
    if (threadId === currThreadId && prevChats.length > 0) return;
    setCurrThreadId(threadId);
    setErrorMsg(null);
    setLoading(true);
    setSidebarOpen(false);

    try {
      const response = await fetch(`${API_BASE}/thread/${threadId}`);
      if (response.ok) {
        const messages = await response.json();
        setPrevChats(Array.isArray(messages) ? messages : []);
      } else {
        setPrevChats([]);
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
      setErrorMsg("Failed to load previous messages for this chat.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an existing thread
  const deleteThread = async (threadId) => {
    try {
      await fetch(`${API_BASE}/thread/${threadId}`, { method: "DELETE" });
      setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  // Send a message
  const sendMessage = async (textToSend) => {
    const messageContent = (textToSend !== undefined ? textToSend : prompt).trim();
    if (!messageContent || loading) return;

    setErrorMsg(null);
    setPrompt("");

    // Optimistically append user message immediately to the UI
    const userMessageObj = { role: "user", content: messageContent, timestamp: new Date() };
    setPrevChats(prev => [...prev, userMessageObj]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: currThreadId,
          message: messageContent
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Failed to generate AI response.");
        return;
      }

      // Append assistant response to UI
      const assistantMessageObj = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      };
      setPrevChats(prev => [...prev, assistantMessageObj]);

      // Refresh threads list
      fetchAllThreads();
    } catch (err) {
      console.error("Message send error:", err);
      setErrorMsg("Failed to communicate with HexoAI backend. Make sure Backend is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    prompt,
    setPrompt,
    currThreadId,
    prevChats,
    allThreads,
    loading,
    errorMsg,
    setErrorMsg,
    sidebarOpen,
    setSidebarOpen,
    backendStatus,
    createNewChat,
    changeThread,
    deleteThread,
    sendMessage,
    fetchAllThreads
  };

  return (
    <MyContext.Provider value={contextValue}>
      <div className="app-container">
        <div 
          className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} 
          onClick={() => setSidebarOpen(false)} 
        />
        <Sidebar />
        <ChatWindow />
      </div>
    </MyContext.Provider>
  );
}

export default App;

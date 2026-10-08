import "./ChatWindow.css";
import { useContext, useState, useRef, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

const PROMPT_SUGGESTIONS = [
  {
    icon: "fa-code",
    title: "Build a Full-Stack API",
    desc: "Create an Express.js CRUD API with MongoDB schema",
    prompt: "Show me how to create a clean, robust Express.js CRUD API with Mongoose and proper error handling."
  },
  {
    icon: "fa-bolt",
    title: "Explain Async & Event Loop",
    desc: "Deep dive into JavaScript asynchronous architecture",
    prompt: "Explain how the JavaScript Event Loop, microtasks, and macrotasks work with simple visual code examples."
  },
  {
    icon: "fa-wand-magic-sparkles",
    title: "Algorithm Optimization",
    desc: "Analyze time and space complexity with examples",
    prompt: "Explain Binary Search and QuickSort algorithms with clean JavaScript implementations and Big-O complexity."
  },
  {
    icon: "fa-palette",
    title: "Modern UI System",
    desc: "Color palettes and clean modern styling tips",
    prompt: "Give me modern CSS layout and clean UI styling techniques with code snippets."
  }
];

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    prevChats,
    loading,
    errorMsg,
    setErrorMsg,
    setSidebarOpen,
    sendMessage
  } = useContext(MyContext);

  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats, loading]);

  // Focus input on mount & new chat
  useEffect(() => {
    inputRef.current?.focus();
  }, [prevChats.length]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <main className="chat-window">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="nav-left">
          <button 
            className="menu-toggle-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle navigation menu"
          >
            <i className="fa-solid fa-bars-staggered"></i>
          </button>
          <div className="nav-title">
            <span className="title-bold">HexoAI</span>
            <span className="agent-sub">AI Assistant</span>
          </div>
        </div>
      </header>

      {/* Main Chat Content */}
      <div className="chat-content-scroll">
        {prevChats.length === 0 ? (
          /* Empty / Welcome State */
          <div className="welcome-hero animate-fade-in">
            <div className="hero-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 22,7.5 22,16.5 12,22 2,16.5 2,7.5" fill="url(#heroGrad)" />
                <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
                <defs>
                  <linearGradient id="heroGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" />
                    <stop offset="0.5" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="hero-title">Meet HexoAI</h1>
            <p className="hero-subtitle">
              Your intelligent AI assistant for coding, problem-solving, and brainstorming.
            </p>

            {/* Quick Prompt Cards */}
            <div className="prompt-grid">
              {PROMPT_SUGGESTIONS.map((item, index) => (
                <div 
                  key={index} 
                  className="prompt-card"
                  onClick={() => sendMessage(item.prompt)}
                >
                  <div className="card-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="card-body">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <i className="fa-solid fa-arrow-right card-arrow"></i>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Message Stream */
          <div className="messages-stream">
            {prevChats.map((chat, idx) => {
              const isUser = chat.role === "user";
              return (
                <div 
                  key={idx} 
                  className={`message-row ${isUser ? "user-row" : "ai-row"} animate-fade-in`}
                >
                  <div className="message-avatar">
                    {isUser ? (
                      <div className="avatar user-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                    ) : (
                      <div className="avatar ai-avatar">
                        <i className="fa-solid fa-atom"></i>
                      </div>
                    )}
                  </div>

                  <div className="message-bubble-wrapper">
                    <div className="message-header-info">
                      <span className="author-name">{isUser ? "You" : "HexoAI"}</span>
                      {!isUser && (
                        <button 
                          className="copy-bubble-btn"
                          onClick={() => handleCopy(chat.content, idx)}
                          title="Copy response"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <i className="fa-solid fa-check text-success"></i> Copied
                            </>
                          ) : (
                            <>
                              <i className="fa-regular fa-copy"></i> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className={`message-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
                      {isUser ? (
                        <p className="user-text">{chat.content}</p>
                      ) : (
                        <div className="markdown-render">
                          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {chat.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading State */}
            {loading && (
              <div className="message-row ai-row animate-fade-in">
                <div className="message-avatar">
                  <div className="avatar ai-avatar pulsing">
                    <i className="fa-solid fa-atom"></i>
                  </div>
                </div>
                <div className="message-bubble-wrapper">
                  <div className="message-header-info">
                    <span className="author-name">HexoAI</span>
                  </div>
                  <div className="message-bubble ai-bubble thinking-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="thinking-text">HexoAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="error-alert animate-fade-in">
          <i className="fa-solid fa-triangle-exclamation error-icon"></i>
          <div className="error-content">
            <span className="error-text">{errorMsg}</span>
            {errorMsg.includes("GEMINI_API_KEY") && (
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="error-link-btn"
              >
                Get Free Gemini Key <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            )}
          </div>
          <button 
            className="error-dismiss" 
            onClick={() => setErrorMsg(null)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Bottom Input Area */}
      <footer className="input-footer">
        <div className="input-box-container">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder="Ask HexoAI anything... (Press Enter to send)"
            value={prompt}
            rows={1}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`send-button ${prompt.trim() && !loading ? "active" : ""}`}
            onClick={() => sendMessage()}
            disabled={!prompt.trim() || loading}
            aria-label="Send message"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-arrow-up"></i>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
}

export default ChatWindow;
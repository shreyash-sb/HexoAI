import "./Sidebar.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function Sidebar() {
  const {
    allThreads,
    currThreadId,
    sidebarOpen,
    setSidebarOpen,
    createNewChat,
    changeThread,
    deleteThread
  } = useContext(MyContext);

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      {/* Sidebar Header & Brand */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="hex-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 22,7.5 22,16.5 12,22 2,16.5 2,7.5" fill="url(#hexGradient)" />
              <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
              <defs>
                <linearGradient id="hexGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <h2>HexoAI</h2>
          </div>
        </div>

        {/* Mobile close button */}
        <button 
          className="mobile-close-btn" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* New Chat Button (Only 1 place to start new chat) */}
      <div className="new-chat-wrapper">
        <button className="new-chat-btn" onClick={createNewChat}>
          <i className="fa-solid fa-plus"></i>
          <span>New Chat</span>
        </button>
      </div>

      {/* Recent Chats Section */}
      <div className="history-section">
        <div className="history-label">
          <span>RECENT CONVERSATIONS</span>
          <span className="count-badge">{allThreads.length}</span>
        </div>

        <ul className="history-list">
          {allThreads.length === 0 ? (
            <li className="empty-history">
              <i className="fa-regular fa-message"></i>
              <p>No chat history yet.<br/>Start a conversation!</p>
            </li>
          ) : (
            allThreads.map((thread) => {
              const isActive = thread.threadId === currThreadId;
              return (
                <li
                  key={thread.threadId}
                  className={`history-item ${isActive ? "active" : ""}`}
                  onClick={() => changeThread(thread.threadId)}
                >
                  <i className="fa-regular fa-comment-dots item-icon"></i>
                  <span className="item-title" title={thread.title || "Chat"}>
                    {thread.title || "Untitled Chat"}
                  </span>
                  <button
                    className="delete-btn"
                    title="Delete Chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.threadId);
                    }}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Sidebar Footer with only Created by Shreyash */}
      <div className="sidebar-footer">
        <div className="developer-tag">
          <p>Created by <strong>Shreyash</strong></p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
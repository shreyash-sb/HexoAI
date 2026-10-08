# HexoAI ⚡

<p align="center">
  <strong>Next-Generation Autonomous AI Agent powered by Google Gemini</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js_+_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## 🌟 Overview

**HexoAI** is a fast, full-stack AI platform built on the MERN stack and powered by **Google Gemini**. Designed with modern dark/light glassmorphic aesthetics, multi-turn conversational memory, real-time thread history, and syntax-highlighted code rendering.

---

## ✨ Features

- **⚡ Blazing Fast Intelligence**: Powered by Google Gemini (`gemini-flash-latest` & `gemini-3.5-flash-lite`).
- **🧠 Multi-Turn Memory**: Preserves context and conversation history across turns.
- **🎨 Modern Aesthetic**: Minimalist interface with Dark & Light mode toggle, prompt suggestions, and responsive sidebar.
- **💻 Developer-Ready**: Markdown rendering with language-tagged syntax highlighting and one-click code copy.
- **🛡️ Resilient Architecture**: Automatic in-memory session fallback ensuring uninterrupted uptime.

---

## 🚀 Quick Start

### 1. Configure Environment
Create a `.env` file in the `Backend/` directory:

```env
# Get your free key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Connection URI
MONGODB_URI=your_mongodb_connection_string_here
```

### 2. Start Backend Server
```bash
cd Backend
npm run dev
```
> Server runs on `http://localhost:8080`

### 3. Start Frontend Client
```bash
cd Frontend
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 🏗️ Project Architecture

```
HexoAI/
├── Backend/
│   ├── models/        # Mongoose data schemas (Thread, Message)
│   ├── routes/        # Express API routes (/api/chat, /api/thread)
│   ├── utils/         # Gemini AI engine with fallback strategy
│   └── server.js      # Server entry point
│
└── Frontend/
    ├── src/
    │   ├── ChatWindow.jsx # Main chat UI, markdown render & themes
    │   ├── Sidebar.jsx    # Conversation threads & navigation
    │   └── MyContext.jsx  # Global application state
    └── vite.config.js     # Vite configuration
```

---

## 👨‍💻 Author

**HexoAI** • Created by **Shreyash**

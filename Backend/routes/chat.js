import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import { getGeminiResponse } from "../utils/gemini.js";

const router = express.Router();

// In-memory fallback cache when MongoDB is offline / connecting
const memoryThreads = new Map();

const isDBConnected = () => mongoose.connection.readyState === 1;

// Health check and AI status
router.get("/status", (req, res) => {
    return res.json({
        service: "HexoAI Backend",
        creator: "Shreyash",
        aiEngine: "Google Gemini 2.5 Flash",
        database: isDBConnected() ? "connected" : "in_memory_fallback",
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim())
    });
});

// Get all chat threads
router.get("/thread", async (req, res) => {
    try {
        if (isDBConnected()) {
            const threads = await Thread.find({}, { threadId: 1, title: 1, updatedAt: 1, createdAt: 1 })
                .sort({ updatedAt: -1 });
            return res.json(threads);
        } else {
            const list = Array.from(memoryThreads.values())
                .map(t => ({ threadId: t.threadId, title: t.title, updatedAt: t.updatedAt }))
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            return res.json(list);
        }
    } catch (err) {
        console.error("Fetch threads error:", err);
        return res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// Get messages for a specific thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        if (isDBConnected()) {
            const thread = await Thread.findOne({ threadId });
            if (!thread) {
                return res.status(404).json({ error: "Thread not found" });
            }
            return res.json(thread.messages);
        } else {
            const thread = memoryThreads.get(threadId);
            if (!thread) {
                return res.status(404).json({ error: "Thread not found" });
            }
            return res.json(thread.messages);
        }
    } catch (err) {
        console.error("Fetch chat error:", err);
        return res.status(500).json({ error: "Failed to fetch chat messages" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        if (isDBConnected()) {
            const deletedThread = await Thread.findOneAndDelete({ threadId });
            memoryThreads.delete(threadId);
            if (!deletedThread) {
                return res.status(404).json({ error: "Thread not found" });
            }
            return res.status(200).json({ success: "Thread deleted successfully" });
        } else {
            if (!memoryThreads.has(threadId)) {
                return res.status(404).json({ error: "Thread not found" });
            }
            memoryThreads.delete(threadId);
            return res.status(200).json({ success: "Thread deleted successfully" });
        }
    } catch (err) {
        console.error("Delete thread error:", err);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Send message & get Gemini AI response
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Both 'threadId' and non-empty 'message' are required" });
    }

    try {
        let thread;
        let isNew = false;

        if (isDBConnected()) {
            thread = await Thread.findOne({ threadId });
        } else {
            thread = memoryThreads.get(threadId);
        }

        // Generate a concise title for new chats
        const generateTitle = (text) => {
            const clean = text.trim().replace(/[\r\n]+/g, " ");
            return clean.length > 36 ? clean.substring(0, 33) + "..." : clean;
        };

        if (!thread) {
            isNew = true;
            thread = {
                threadId,
                title: generateTitle(message),
                messages: [{ role: "user", content: message, timestamp: new Date() }],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } else {
            thread.messages.push({ role: "user", content: message, timestamp: new Date() });
        }

        // Multi-turn conversation context
        const history = thread.messages.slice(0, -1).map(m => ({
            role: m.role,
            content: m.content
        }));

        // Call Google Gemini API
        const assistantReply = await getGeminiResponse(history, message);

        thread.messages.push({
            role: "assistant",
            content: assistantReply,
            timestamp: new Date()
        });
        thread.updatedAt = new Date();

        // Save to DB or in-memory
        if (isDBConnected()) {
            if (isNew) {
                const newDoc = new Thread(thread);
                await newDoc.save();
            } else {
                await thread.save();
            }
        } else {
            memoryThreads.set(threadId, thread);
        }

        return res.json({
            reply: assistantReply,
            threadId,
            title: thread.title
        });
    } catch (err) {
        console.error("Chat route error:", err.message);
        return res.status(500).json({
            error: err.message || "Failed to generate AI response with Gemini."
        });
    }
});

export default router;
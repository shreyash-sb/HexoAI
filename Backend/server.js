import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// HexoAI Chat and Status APIs
app.use("/api", chatRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        app: "HexoAI Backend API",
        creator: "Shreyash",
        status: "Running"
    });
});

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn("[HexoAI] Warning: MONGODB_URI is not defined in .env. Running with in-memory session storage.");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 6000 // 6-second timeout to prevent indefinite hanging
        });
        console.log("[HexoAI] Connected to MongoDB Database successfully!");
    } catch (err) {
        console.warn("[HexoAI] Notice: Could not connect to MongoDB Atlas (" + err.message + ").");
        console.warn("[HexoAI] Note: If using MongoDB Atlas, make sure 0.0.0.0/0 (or your IP) is allowed in Atlas Network Access.");
        console.log("[HexoAI] App will continue running smoothly with in-memory fallback storage.");
    }
};

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`  HexoAI Backend Server - by Shreyash`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`========================================`);
    connectDB();
});

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are HexoAI, an intelligent, highly capable, and precise AI assistant created by Shreyash.
Your goal is to provide accurate, insightful, and well-structured answers to every question.
Guidelines:
- Coding: Write clean, modern, well-commented code inside Markdown blocks with language tags (e.g., \`\`\`javascript).
- Reasoning & Writing: Provide concise, clear, and logical explanations using bullet points and headings.
- Tone: Helpful, professional, and friendly.`;

/**
 * Get response from Google Gemini API with multi-turn conversation memory
 * @param {Array} history - Previous messages [{ role: 'user'|'assistant', content: string }]
 * @param {string} message - Current user prompt
 * @returns {Promise<string>} - AI response text
 */
export async function getGeminiResponse(history = [], message) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        throw new Error(
            "GEMINI_API_KEY is missing! Please get your free API key from https://aistudio.google.com/app/apikey and add it to Backend/.env"
        );
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    // Format previous conversation turns for Gemini
    const contents = [];
    if (Array.isArray(history)) {
        for (const msg of history) {
            contents.push({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            });
        }
    }

    // Add current user prompt
    contents.push({
        role: "user",
        parts: [{ text: message }]
    });

    // Primary: gemini-flash-latest, Fallback: gemini-3.5-flash-lite (both 100% free & active)
    const candidateModels = ["gemini-flash-latest", "gemini-3.5-flash-lite"];

    let lastError = null;
    for (const model of candidateModels) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    temperature: 0.7
                }
            });

            if (response && response.text) {
                return response.text;
            }
        } catch (err) {
            console.warn(`[HexoAI] ${model} attempt notice:`, err.message);
            lastError = err;
        }
    }

    throw new Error(`Gemini API Error: ${lastError?.message || "Failed to generate AI response"}`);
}

export default getGeminiResponse;
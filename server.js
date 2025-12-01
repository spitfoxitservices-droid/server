import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xssClean from "xss-clean";
import fetch from "node-fetch";
import { knowledge } from "./knowledge.js";

let conversationHistory = [];

const app = express();

/* ============================
   1) SECURITY MIDDLEWARE
   ============================ */

// HTTP security headers
app.use(helmet());

// basic XSS προστασία σε body/query/headers
app.use(xssClean());

// επιτρέπουμε μόνο το κανονικό σου site
app.use(
  cors({
    origin: "https://spitfoxitservices.com",
    methods: ["GET", "POST"],
  })
);

// JSON body με όριο μεγέθους
app.use(bodyParser.json({ limit: "1mb" }));

// rate limiting ΜΟΝΟ στο /chat
const chatLimiter = rateLimit({
  windowMs: 30 * 1000, // 30"
  max: 10,             // max 10 requests / 30"
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
  },
});

/* ============================
   2) HEALTH CHECK
   ============================ */

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Foxxy chat backend 🦊" });
});

/* ============================
   3) FOXXY /chat ENDPOINT
   ============================ */

app.post("/chat", chatLimiter, async (req, res) => {
  try {
    const userMessageRaw = req.body?.message;

    // basic validation
    if (typeof userMessageRaw !== "string") {
      return res.status(400).json({
        reply: "I need a text message to respond.",
      });
    }

    const userMessage = userMessageRaw.trim();

    if (!userMessage) {
      return res.status(400).json({
        reply: "Please type a message first.",
      });
    }

    if (userMessage.length > 1000) {
      return res.status(413).json({
        reply:
          "That message is a bit too long for a single reply. Try shortening it.",
      });
    }

    const lower = userMessage.toLowerCase();

    const systemPrompt = `
You are Foxxy, an AI Assistant.

Use ONLY the information below.
If the user asks something outside of your knowledge base, reply:
"This is not included in the Spitfox IT Services knowledge base. I can only assist you using the available information."


--- Spitfox ---
${knowledge.company.join("\n")}

--- SERVICES ---
${knowledge.services.join("\n")}

--- INDUSTRIES ---
${knowledge.Industries.join("\n")}

${knowledge.Project.join("\n")}
${knowledge.Analysis.join("\n")}
${knowledge.AI.join("\n")}

--- Owner ---
${knowledge.owner.join("\n")}

--- Philosophy ---
${knowledge.philosophy.join("\n")}

--- Vision ---
${knowledge.Vision.join("\n")}

--- Mission ---
${knowledge.Mission.join("\n")}

Rules:
1. Don't make up information.
2. Don't add services that don't exist.
3. If the answer requires knowledge outside of the above content, state it.
4. Answers should be strictly based on what you see above.
5. The answer must be 100% compatible with the knowledge.
6. Say who you are only if the user asks or if he greets you.
7. Don't repeat your name in every answer.
8. Provide short answers. One sentence if possible.

Answer clearly, briefly, professionally.
`;

    // 1) Quick intents (ραντεβού, email, τιμές)
    if (
      lower.includes("ραντεβ") ||
      lower.includes("meeting") ||
      lower.includes("call")
    ) {
      return res.json({
        reply: `
          Book your call with us:<br>
          <button class="cal-btn">Book Now</button>
        `,
      });
    }

    if (
      lower.includes("email") ||
      lower.includes("επικοινων") ||
      lower.includes("contact")
    ) {
      return res.json({
        reply:
          "You may communicate with us at info@spitfoxitservices.com",
      });
    }

    if (
      lower.includes("τιμη") ||
      lower.includes("cost") ||
      lower.includes("price")
    ) {
      return res.json({
        reply: `
          Our pricing varies depending on the project. Schedule a call with us to discuss your specific needs.<br>
          <button class="cal-btn">Book Now</button>
        `,
      });
    }

    // 2) Μνήμη συνομιλίας (μόνο τα τελευταία)
    conversationHistory.push({ role: "user", content: userMessage });
    if (conversationHistory.length > 40) {
      conversationHistory = conversationHistory.slice(-40);
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("Missing GROQ_API_KEY env");
      return res.status(500).json({
        reply:
          "Server configuration error. The fox is missing its key. Please try again later.",
      });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // 3) Call στο Groq με timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15"

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Groq API error:", response.status, await response.text());
      return res.status(502).json({
        reply:
          "The fox ran into an issue talking to the model. Please try again in a moment.",
      });
    }

    const data = await response.json();

    const botReply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Your message puzzled even a clever fox. Try again or pick one of the options below.";

    // 4) Αποθήκευση απάντησης στη μνήμη
    conversationHistory.push({ role: "assistant", content: botReply });
    if (conversationHistory.length > 40) {
      conversationHistory = conversationHistory.slice(-40);
    }

    return res.json({ reply: botReply });
  } catch (err) {
    console.error("Groq /chat error:", err);

    if (err.name === "AbortError") {
      return res.status(504).json({
        reply:
          "The connection took too long. The fox lost the trail. Let’s try again in a moment.",
      });
    }

    return res.status(500).json({
      reply:
        "Server error. Even a clever fox can stumble sometimes. Please try again later.",
    });
  }
});

/* ============================
   4) START SERVER
   ============================ */

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Secure Foxxy running on port " + port);
});

//
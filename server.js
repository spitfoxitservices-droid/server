import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import { knowledge } from "./knowledge.js";
let conversationHistory = [];


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const lower = userMessage.toLowerCase();
  const systemPrompt = `
You are the Foxxy an AI Assistant.

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
7. Don'r repeat your name in every answer.
8. Provide short answers. One sentenence if possible.

Answer clearly, briefly, professionally
`;


  // 1) Intent detection
if (
  lower.includes("ραντεβ") ||
  lower.includes("meeting") ||
  lower.includes("call")
) {
  return res.json({
    reply: `
      Book your call with us:<br>
      <button class="cal-btn">Book Now</button>
    `
  });
}


  if (lower.includes("email") || lower.includes("επικοινων")||lower.includes("contact")) {
    return res.json({ reply: "You may communicate with us at info@spitfoxitservices.com" });
  }

  if (lower.includes("τιμη") || lower.includes("cost") || lower.includes("price")) {
	return res.json({
    reply: `
      Our pricing varies depending on the project. Schedule a call with us to discuss your specific needs.<br>
      <button class="cal-btn">Book Now</button>
    `
  });
  }

  // 2) Add user message to memory
  conversationHistory.push({ role: "user", content: userMessage });
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",  
        messages: [
          { role: "system", content: systemPrompt },...conversationHistory,
		  { role: "user", content: userMessage },
          { role: "assistant", content: "I understand. I will only answer based on the information in the Spitfox knowledge base." }
        ]
      })
    });
    const data = await response.json();
	


    const botReply =
      data?.choices?.[0]?.message?.content ||
      "I prefer not to respond to that.";

    res.json({ reply: botReply });
    console.log("MODEL RAW RESPONSE:", data?.choices?.[0]?.message?.message);

  } catch (err) {
    console.error("Groq Error:", err);
    res.json({ reply: "Server error. Something went wrong." });
  }
});
/*
app.listen(3000, () => {
  console.log("Chatbot running on port 3000");
});
/*/
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running.");
});

app.listen(port, () => {
  console.log("Chatbot running on port " + port);
});

const axios = require('axios');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const { getRelevantContext } = require('./documentService');
const TaxRecord = require('../models/TaxRecord');
const aiResponseGenerator = require('./aiResponseGenerator');
const { generateDummyData } = require('./dataGenerator');
const { loadKnowledgeBase } = require('./documentService');

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return "hindi"; // Correctly identifies Hindi/Marathi script
  return "english";
}

function detectIntent(message) {
  const text = message.toLowerCase();

  // GREETING
  if (["hi", "hello", "hey", "नमस्कार", "नमस्ते"].some(g => text.includes(g))) {
    return "GREETING";
  }

  const isDataRequest = (
    (text.includes("show") || text.includes("list") || text.includes("display") || text.includes("get") || text.includes("दाखवा") || text.includes("यादी") || text.includes("मिळवा")) &&
    (["ward", "defaulter", "due", "record", "tax", "वार्ड", "डिफॉल्टर", "कर"].some(k => text.includes(k)))
  ) || (
    /ward\s?\d+/i.test(text) || /वार्ड\s?\d+/i.test(text)
  ) || (
    ["pending due", "pending tax", "defaulters list", "tax record", "डिफॉल्टर यादी"].some(k => text.includes(k))
  );

  if (isDataRequest) return "DATA";

  // DOCUMENT → Theoretical or 'how to' questions
  if (["law", "act", "rule", "procedure", "what is", "how to", "कायदा", "नियम", "काय आहे", "माहिती"].some(k => text.includes(k))) {
    return "DOCUMENT";
  }

  return "GENERAL";
}

const DEFAULT_PROMPT = `You are a smart municipal assistant.

- Understand the user question deeply
- Use provided data or context to give a comprehensive and detailed response
- Answer clearly in simple human language, but provide thorough insights
- When data lists are provided, summarize trends, highlight top cases, and provide an analytical overview
- Avoid being overly brief; aim for rich, informative answers that go beyond just 2-3 sentences.`;

async function callOpenAI(prompt, systemContent = DEFAULT_PROMPT) {
  try {
    console.log("Using OpenAI model: gpt-4o-mini");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return "Sorry, I couldn't process your request.";
  }
}

async function processMessage(message) {
  const lang = detectLanguage(message);
  const intent = detectIntent(message);
  
  let finalResponse = { text: "", data: null };

  const systemPrompt = `You are a smart municipal assistant.

IMPORTANT:
- Answer in the SAME language as the user input.
- User input language: ${lang}
- If user asks in Hindi → reply in Hindi.
- If Marathi → reply in Marathi.
- If English → reply in English.

Answer clearly and simply. Provide thorough insights for datasets.`;

  try {
    if (intent === "GREETING") {
      const greetings = {
        hindi: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?",
        english: "Hello! How can I help you with property tax, defaulters, and municipal data?",
        marathi: "नमस्कार! मी तुम्हाला कर आणि महापालिका डेटा संबंधित कशी मदत करू शकतो?"
      };
      // For greeting, we use a slightly smarter check for Marathi common words if script is devanagari
      let actualLang = lang;
      if (lang === "hindi" && (message.includes("कशी") || message.includes("मी") || message.includes("आहे"))) {
        actualLang = "marathi";
      }

      finalResponse.text = greetings[actualLang] || greetings.english;
      return finalResponse;
    }

    if (intent === "DATA") {
      let records = [];
      try {
        const wardMatch = message.match(/(\d+)/);
        const Property = require('../models/Property');
        
        let taxRecords = [];
        if (wardMatch) {
            const wardNum = wardMatch[1];
            const properties = await Property.find({ ward: new RegExp(`^${wardNum}$`, 'i') }).lean();
            if (properties.length > 0) {
                const propIds = properties.map(p => p._id);
                taxRecords = await TaxRecord.find({ propertyId: { $in: propIds } }).populate('propertyId').limit(50).lean();
            }
        } else {
             taxRecords = await TaxRecord.find({}).populate('propertyId').limit(50).lean();
        }

        records = taxRecords.map(tr => ({
            owner: tr.propertyId?.ownerName || "Unknown",
            ward: tr.propertyId?.ward || "-",
            due: tr.remainingAmount || 0,
            status: tr.paymentStatus || "Unknown",
            propertyId: tr.propertyId?.propertyId || "-"
        }));

      } catch (err) {
        console.error("DB Fetch Error:", err);
      }

      if (!records || records.length === 0) {
        const context = await loadKnowledgeBase();
        const data = generateDummyData(context);
        
        let filtered = data;
        const wardMatchLocal = message.match(/ward\s*(\d+)/i) || message.match(/वार्ड\s*(\d+)/i);
        if (wardMatchLocal) {
            const wNum = parseInt(wardMatchLocal[1], 10);
            filtered = data.filter(d => d.ward === wNum);
        }

        const isDefaulterOnly = message.toLowerCase().includes("defaulter") || message.includes("डिफॉल्टर");
        if (isDefaulterOnly) {
            filtered = filtered.filter(d => d.status !== "paid");
        }

        const count = filtered.length;
        const msgHeader = (lang === "hindi" || message.includes("दाखवा"))
            ? `Retrieved ${count} records. (Processing in your language...)` 
            : `Retrieved ${count} matching records for your query.`;

        // We use AI to generate the actual summary text for dummy data too if possible
        const summary = await aiResponseGenerator.generateResponse(message, filtered.slice(0, 10), 'DATA');
        
        return {
          text: summary,
          data: filtered.slice(0, 50)
        };
      }

      const dataSummary = await aiResponseGenerator.generateResponse(message, records, 'DATA');
      finalResponse.text = dataSummary;
      finalResponse.data = records;
    } 
    else if (intent === "DOCUMENT") {
      const docContext = await getRelevantContext(message);
      const prompt = `Using this context: ${docContext}\n\nQuestion: ${message}`;
      finalResponse.text = await callOpenAI(prompt, systemPrompt);
    } 
    else {
      finalResponse.text = await callOpenAI(message, systemPrompt);
    }

    // Secondary Check: If LLM failed to respond in the correct language
    if (lang === "hindi" && /^[a-zA-Z0-9\s.,!?'"]+$/.test(finalResponse.text)) {
        const transPrompt = `Respond to this in Hindi or Marathi as appropriate: ${finalResponse.text}`;
        finalResponse.text = await callOpenAI(transPrompt, systemPrompt);
    }

    return finalResponse;

  } catch (error) {
    console.error("AI Service Error:", error);
    return { text: "I encountered an error. Please try again." };
  }
}

module.exports = { processMessage };

const openAiService = require('./openAiService');

class AIResponseGenerator {

  detectLanguage(text) {
    if (!text) return "English";

    // Marathi detection (basic Unicode range)
    if (/[\u0900-\u097F]/.test(text)) {
      // Could be Hindi or Marathi → check common Marathi words
      if (/(का|आहे|मला|तुम्ही|करा)/.test(text)) return "Marathi";
      return "Hindi";
    }

    return "English";
  }

  /**
   * Detect if query is tax-related
   */
  isTaxQuery(query) {
    const taxKeywords = [
      "tax", "property tax", "paid", "unpaid",
      "due", "defaulters", "pending tax",
      "कर", "टॅक्स", "कर भरला", "थकबाकी",
      "टैक्स", "बकाया", "कर नहीं दिया"
    ];

    return taxKeywords.some(keyword =>
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Generate response
   */
  async generateResponse(query, data = [], intent = 'GENERAL') {

    const language = this.detectLanguage(query);
    const isTax = this.isTaxQuery(query);

    let dataSourceInstruction = "";

    if (isTax) {
      dataSourceInstruction = `
      The query is related to TAX.
      STRICTLY use data from "Tax_sahayak_extended_dataset".
      Focus on unpaid taxes, defaulters, pending dues, etc.
      `;
    } else {
      dataSourceInstruction = `
      The query is NOT limited to tax.
      Use general database knowledge + AI reasoning.
      `;
    }

    const dataSummary = this.formatDataSummary(data);

    const messages = [
      {
        role: "system",
        content: `
You are Sevankur AI, a smart municipal assistant.

STRICT LANGUAGE RULE:
- You MUST respond in the EXACT SAME language as the user.
- User Language: ${language}
- If ${language} is Hindi → Use Devanagari script for ALL text.
- If ${language} is Marathi → Use Devanagari script for ALL text.
- NEVER mix English text into a Hindi/Marathi response unless it is a proper noun like a Property ID.

Data Handling Rule:
${dataSourceInstruction}

Intent: ${intent}

Available Data for Summary:
${dataSummary}

Response Guidelines:
- Provide a professional, detailed summary.
- Highlight key insights from the data provided.
- Maintain a formal and helpful tone.
        `
      },
      { role: "user", content: query }
    ];

    try {
      const completion = await openAiService.getChatCompletion(messages, { temperature: 0.7 });

      if (!completion) {
        return this.getFallbackMessage(language);
      }

      return completion.choices[0].message.content;

    } catch (error) {
      console.error("Response Generation Failed:", error.message);
      return this.getFallbackMessage(language);
    }
  }

  /**
   * Format DB data
   */
  formatDataSummary(data) {
    if (!data || data.length === 0) return "No data found matching the query.";

    return data.map(d => {
      return `Property ${d.propertyId} (Owner: ${d.owner}, Ward: ${d.ward}, Due: ₹${d.due}, Status: ${d.status})`;
    }).join("; ");
  }

  /**
   * Multilingual fallback messages
   */
  getFallbackMessage(language) {
    const messages = {
      English: "I'm having trouble generating a response. Please try again.",
      Hindi: "मुझे उत्तर देने में समस्या हो रही है। कृपया फिर से प्रयास करें।",
      Marathi: "मला उत्तर देताना अडचण येत आहे. कृपया पुन्हा प्रयत्न करा."
    };

    return messages[language] || messages["English"];
  }
}

module.exports = new AIResponseGenerator();
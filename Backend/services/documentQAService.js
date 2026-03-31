const documentKnowledgeBase = require('./documentKnowledgeBase');
const openAiService = require('./openAiService');

/**
 * RAG (Retrieval-Augmented Generation) Service for Q&A based on documents
 */
class DocumentQAService {
  /**
   * Main function to answer questions using document context
   */
  async answerQuestion(query) {
    try {
      // 1. Retrieve most relevant chunks from KnowledgeBase
      const chunks = await documentKnowledgeBase.findRelevantChunks(query, 3);
      
      const context = chunks.map(c => c.content).join("\n\n---\n\n");

      // 2. Prepare RAG-specific Prompt for Grok
      const messages = [
        {
          role: "system",
          content: `You are Sevankur AI Document Assistant. 
          Use the following context from municipal documents to answer the user's question. 
          If the context doesn't contain the answer, say "I couldn't find information about that in the documents I've analyzed, but I'll continue to learn."
          
          DOCUMENT CONTEXT:
          ${context || "No relevant document snippets found."}`
        },
        { role: "user", content: query }
      ];

      // 3. Generate Answer
      const completion = await openAiService.getChatCompletion(messages, { temperature: 0.5 });
      
      if (!completion) {
        return "I'm having trouble retrieving information from our documentation right now.";
      }

      return completion.choices[0].message.content;

    } catch (error) {
      console.error("❌ Document Q&A Error:", error.message);
      return "An error occurred while analyzing the municipal documents.";
    }
  }
}

module.exports = new DocumentQAService();

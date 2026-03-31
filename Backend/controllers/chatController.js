const chatMessageProcessor = require('../services/chatMessageProcessor');
const { generatePDF } = require('../services/pdfService');
const openAiService = require('../services/openAiService');
const fs = require('fs');

/**
 * Handles incoming chat messages from the frontend.
 * @route POST /api/chat
 */
exports.postChatMessage = async (req, res) => {
  try {
    const { message, context } = req.body;

    // Debug log for integration tracing
    console.log("User message:", message);

    if (!message) {
      return res.status(400).json({
        text: "Please enter a question.",
        data: [],
        chartData: {}
      });
    }

    // Use authenticated user id if available, otherwise anonymous
    const userId = req.user?.id || 'anonymous';

    // Call End-to-End Chat Processor (History + AI + Data)
    const result = await chatMessageProcessor.processMessage(userId, message, context || {});

    // TASK 3: Add Debug Log for AI response
    console.log("AI response:", result);

    // TASK 1: Ensure Backend ALWAYS Responds
    return res.json({
      text: result.text || "No response available",
      data: result.data || []
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    // TASK 4: Handle Errors
    return res.json({
      text: "Error processing request"
    });
  }
};

/**
 * Exports data to PDF and sends for download.
 * @route POST /api/chat/export-pdf
 */
exports.exportPDF = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ text: "Valid data is required to export PDF." });
    }

    const filePath = generatePDF(data, `Sevankur_Report_${Date.now()}.pdf`);

    // Give time for stream to close
    setTimeout(() => {
        res.download(filePath, (err) => {
            if (err) console.error("PDF Download Error:", err);
            // Optional: delete file after download
            // fs.unlinkSync(filePath);
        });
    }, 500);

  } catch (error) {
    console.error("PDF Export Controller Error:", error);
    res.status(500).json({ text: "Error generating PDF report." });
  }
};
/**
 * Transcribes audio using Whisper
 * @route POST /api/chat/transcribe
 */
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ text: "No audio file provided" });
    }

    const text = await openAiService.transcribeAudio(req.file.path);
    
    // Clean up temporary audio file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({ text });
  } catch (error) {
    console.error("Transcription Controller Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ text: "Error transcribing audio" });
  }
};

const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Service to handle document text extraction (PDF & DOCX)
 */
class DocumentParserService {
  /**
   * Extract text from a PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} - Extracted text
   */
  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`❌ PDF Extraction Error (${filePath}):`, error.message);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from a DOCX file
   * @param {string} filePath - Path to the DOCX file
   * @returns {Promise<string>} - Extracted text
   */
  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value; // The raw text from the document
    } catch (error) {
      console.error(`❌ DOCX Extraction Error (${filePath}):`, error.message);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  /**
   * Auto-detect file type and parse accordingly
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Extracted text
   */
  async parseDocument(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
      return this.parsePDF(filePath);
    } else if (extension === 'docx') {
      return this.parseDOCX(filePath);
    } else {
      throw new Error(`Unsupported document format: .${extension}`);
    }
  }
}

module.exports = new DocumentParserService();

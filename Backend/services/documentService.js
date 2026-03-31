const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const DOCS_DIR = path.join(__dirname, 'docs');

// Absolute path to the pdfjs-dist legacy worker
const WORKER_PATH = 'file:///' + 
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')
       .replace(/\\/g, '/');

// In-memory cache — load documents once per server startup
let _knowledgeBaseCache = null;

/**
 * Extracts text from a PDF file using pdfjs-dist (Node.js legacy build).
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractPdfText(filePath) {
  try {
    const data = fs.readFileSync(filePath);

    // Dynamic import required — pdfjs-dist v5 is ESM only
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_PATH;

    const standardFontDataUrl = path.join(
      __dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts'
    ).replace(/\\/g, '/') + '/';

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      standardFontDataUrl: 'file:///' + standardFontDataUrl
    });
    const doc = await loadingTask.promise;

    const pageTexts = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str || '').join(' ');
      pageTexts.push(pageText);
    }

    return pageTexts.join('\n');
  } catch (err) {
    console.error(`[DocumentService] Failed to parse PDF: ${path.basename(filePath)}`, err.message);
    return '';
  }
}

/**
 * Extracts plain text from a DOCX file using mammoth.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function extractDocxText(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    console.error(`[DocumentService] Failed to parse DOCX: ${path.basename(filePath)}`, err.message);
    return '';
  }
}

/**
 * Loads all PDF and DOCX files from DOCS_DIR, extracts text,
 * and returns a combined knowledge base string.
 *
 * Results are cached after first load — call clearCache() to reload.
 *
 * @returns {Promise<string>}
 */
async function loadKnowledgeBase() {
  if (_knowledgeBaseCache !== null) {
    return _knowledgeBaseCache;
  }

  if (!fs.existsSync(DOCS_DIR)) {
    console.warn('[DocumentService] docs/ directory not found at:', DOCS_DIR);
    _knowledgeBaseCache = '';
    return '';
  }

  const files = fs.readdirSync(DOCS_DIR);
  const textParts = [];
  let totalParsed = 0;

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const ext = path.extname(file).toLowerCase();

    let text = '';
    if (ext === '.pdf') {
      console.log(`[DocumentService] Parsing PDF: ${file}`);
      text = await extractPdfText(filePath);
    } else if (ext === '.docx') {
      console.log(`[DocumentService] Parsing DOCX: ${file}`);
      text = await extractDocxText(filePath);
    } else {
      continue; // skip .zip, .txt, etc.
    }

    if (text.trim().length > 50) {
      textParts.push(`\n\n=== SOURCE: ${file} ===\n${text}`);
      totalParsed++;
    } else {
      console.warn(`[DocumentService] Skipped (no text extracted): ${file}`);
    }
  }

  _knowledgeBaseCache = textParts.join('\n');
  console.log(`[DocumentService] Knowledge base ready. Files: ${totalParsed}/${files.length}, Total chars: ${_knowledgeBaseCache.length}`);
  return _knowledgeBaseCache;
}

/**
 * Searches the knowledge base text for paragraphs most relevant to the user query.
 *
 * Strategy:
 *  1. Extract meaningful keywords from the query
 *  2. Score each paragraph by keyword frequency
 *  3. Return top matches combined up to ~4000 chars
 *  4. Fallback: return first 4000 chars of full text
 *
 * @param {string} query
 * @returns {Promise<{ context: string, found: boolean }>}
 */
async function getRelevantContext(query) {
  const fullText = await loadKnowledgeBase();

  if (!fullText.trim()) {
    return "";
  }

  const docs = fullText.split(/\n{2,}/).map(p => p.trim()).filter(p => p.length > 40);
  const keywords = query.toLowerCase().split(" ");

  const relevantChunks = docs.filter(chunk =>
    keywords.some(word => chunk.toLowerCase().includes(word))
  );

  if (relevantChunks.length === 0) {
    return fullText; // Fallback to full doc text
  }

  // Cap size so it fits in context window
  return relevantChunks.join("\n\n").substring(0, 4000);
}

/**
 * Clears the in-memory knowledge base cache (e.g., after uploading new docs).
 */
function clearCache() {
  _knowledgeBaseCache = null;
  console.log('[DocumentService] Cache cleared.');
}

module.exports = { loadKnowledgeBase, getRelevantContext, clearCache };

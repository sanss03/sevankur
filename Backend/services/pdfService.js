const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates a PDF report from tax data and returns the absolute file path.
 */
function generatePDF(data, filename = "report.pdf") {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, "..", "tmp", filename);

  // Ensure tmp directory exists
  const tmpDir = path.dirname(filePath);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Sevankur Tax Report", { align: "center" });
  doc.moveDown();

  data.forEach((item, index) => {
    const owner = item.owner || "Anonymous Owner";
    const ward = item.ward || "N/A";
    const due = item.due ?? item.amountDue ?? item.taxAmount ?? 0;
    const status = item.status || "N/A";

    doc.fontSize(12).text(
      `${index + 1}. ${owner} | Ward: ${ward} | Due: ₹${due} | Status: ${status}`
    );
  });

  doc.end();

  return filePath;
}

module.exports = { generatePDF };

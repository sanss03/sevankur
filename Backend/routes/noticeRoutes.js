const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

function generateNoticeText(user) {
  return `
  MUNICIPAL CORPORATION NOTICE

  To: ${user.owner}

  Subject: Property Tax Due Notice

  Dear ${user.owner},

  As per municipal records, your property in Ward ${user.ward || 'N/A'} (ID: ${user.uid || 'N/A'})
  has pending dues of ${user.dues || '₹0'}.

  You are requested to clear the amount within 15 days
  to avoid penalties and legal action.

  Regards,
  Municipal Tax Department
  `;
}

router.post('/send-bulk-notice', async (req, res) => {
  try {
    const { defaulters } = req.body;
    if (!defaulters || !Array.isArray(defaulters)) {
      return res.status(400).json({ message: "Invalid defaulters data" });
    }

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Bulk_Notices_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    defaulters.forEach((user, index) => {
      if (index > 0) doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text("MUNICIPAL CORPORATION", { align: "center" });
      doc.fontSize(14).text("OFFICIAL NOTICE", { align: "center" });
      doc.moveDown(1);
      doc.fontSize(12).font('Helvetica').text(generateNoticeText(user), {
        align: 'left',
        lineGap: 2
      });
    });

    doc.end();

  } catch (err) {
    console.error("Bulk Notice Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate bulk notices" });
    }
  }
});

module.exports = router;

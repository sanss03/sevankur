const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { faker } = require('@faker-js/faker');
const { loadKnowledgeBase } = require('../services/documentService');
const { generateDummyData } = require('../services/dataGenerator');

router.post('/generate', async (req, res) => {
    try {
        const { type, ward, year } = req.body;
        const doc = new PDFDocument({ margin: 50 });
        
        let reportTitle = type || "Municipal Report";
        if (ward && ward !== 'All Wards') reportTitle += ` - ${ward}`;
        if (year) reportTitle += ` (${year})`;

        let jsonData = [];
        let headers = [];

        if (type === "Collection Summary") {
            headers = ["Ward", "Target", "Collected", "Shortfall"];
            for(let i=1; i<=5; i++) {
                const target = faker.number.int({ min: 100000, max: 200000 });
                const collected = faker.number.int({ min: 50000, max: target });
                jsonData.push({
                    Ward: `Ward ${i}`,
                    Target: target,
                    Collected: collected,
                    Shortfall: target - collected
                });
            }
        } 
        else if (type === "Defaulter List" || type?.includes("Defaulter")) {
            headers = ["Owner", "Contact", "Ward", "Due Amount"];
            
            // USE SAME GENERATED DATA CONTEXT
            const contextStr = await loadKnowledgeBase();
            const genData = generateDummyData(contextStr);
            
            genData.forEach(d => {
                jsonData.push({
                    Owner: d.owner,
                    Contact: faker.phone.number(),
                    Ward: `Ward ${d.ward}`,
                    "Due Amount": d.amountDue
                });
            });
        }
        else if (type === "Ward Comparison" || type?.includes("Comparison")) {
            headers = ["Ward", "Recovery Rate", "Active Cases", "Efficiency"];
            for(let i=1; i<=5; i++) {
                jsonData.push({
                    Ward: `Ward ${i}`,
                    "Recovery Rate": `${faker.number.int({min:60, max:98})}%`,
                    "Active Cases": faker.number.int({min:5, max:40}),
                    Efficiency: faker.helpers.arrayElement(['Excellent','Good','Average','Poor'])
                });
            }
        }

        const { format } = req.body;
        let filename = reportTitle.replace(/[^a-zA-Z0-9]/g, '_');

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            
            let csvStr = headers.join(',') + '\n';
            jsonData.forEach(row => {
                csvStr += headers.map(h => `"${row[h]}"`).join(',') + '\n';
            });
            return res.send(csvStr);
        }

        // doc is already instantiated at the beginning of the block
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        doc.pipe(res);

        doc.fontSize(22).text(reportTitle, { align: "center", underline: true });
        doc.moveDown(2);

        if (headers.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text(headers.join(" | "));
            doc.moveDown(0.5);
            doc.font('Helvetica');
            jsonData.forEach((row) => {
                doc.fontSize(12).text(headers.map(h => row[h]).join(" | "));
                doc.moveDown(0.2);
            });
        } else {
            // General generic report layout
            doc.fontSize(14).text("Report generated successfully on " + new Date().toLocaleDateString());
            doc.moveDown(1);
            doc.font('Helvetica-Oblique').fontSize(12).text("Summary of data for " + reportTitle);
        }
        
        doc.end();

    } catch (err) {
        console.error("PDF generation error:", err);
        if (!res.headersSent) res.status(500).json({ error: "Failed to generate report" });
    }
});

router.get('/', (req, res) => res.json({ message: 'Report endpoint ready' }));

module.exports = router;

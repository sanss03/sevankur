
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY ? "Loaded (" + process.env.OPENAI_API_KEY.substring(0, 4) + "...)" : "Missing");

const app = express();
app.use(express.json());
app.use(cors());

// Basic test route
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: "Backend running" });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// System Health & Metrics
app.use('/api/system', require('./routes/healthRoutes'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/tax-records', require('./routes/taxRecordsRoutes'));
app.use('/api/defaulters', require('./routes/defaultersRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));

// Standalone endpoint for downloading the Ward 4 Defaulter Dummy Report
app.post('/api/download-report', (req, res) => {
    try {
        const PDFDocument = require("pdfkit");
        const { faker } = require('@faker-js/faker');
        
        // 1. Generate bulk dataset
        const data = [
            { owner: "Rahul", ward: 4, due: 5000 },
            { owner: "Sneha", ward: 4, due: 3200 }
        ];
        
        // Adding more bulk defaulters via faker
        for (let i = 0; i < 48; i++) {
            data.push({
                owner: faker.person.fullName(),
                ward: 4,
                due: faker.number.int({ min: 2000, max: 50000 })
            });
        }
        
        // 2. Formatting & Generating PDF Stream
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Ward_4_Defaulter_Report.pdf"');
        doc.pipe(res);
        
        // Title
        doc.fontSize(22).text("Ward 4 Defaulter Report", { align: "center" });
        doc.moveDown(1.5);
        
        // Columns header
        doc.fontSize(14).font('Helvetica-Bold')
           .text("Owner | Ward | Due", { underline: true });
        doc.moveDown(0.5);
        
        // Rows
        doc.font('Helvetica');
        data.forEach((item, idx) => {
            doc.fontSize(12).text(`${idx + 1}. ${item.owner} | Ward ${item.ward} | ₹${item.due}`);
        });
        
        doc.end();
    } catch (err) {
        console.error("PDF Generate Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ text: "Failed to generate dummy report." });
        }
    }
});

// Error Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.warn('The server is running, but database features will not work until credentials are fixed.');
        // Don't exit process in development, let the server stay alive
        if (process.env.NODE_ENV === 'production') process.exit(1);
    }
};

module.exports = connectDB;

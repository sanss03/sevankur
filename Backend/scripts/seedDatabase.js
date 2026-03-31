const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const Property = require('../models/Property');
const TaxRecord = require('../models/TaxRecord');

// Load environment variables
dotenv.config();

const CITIES = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Thane', 'Solapur'];
const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'land'];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for advanced seeding...");

        // 1. Clear existing data (Ensures idempotency - can be run multiple times)
        await Property.deleteMany({});
        await TaxRecord.deleteMany({});
        console.log("Existing data cleared.");

        // 2. Generate Properties
        const properties = [];
        const numProperties = 20;

        for (let i = 0; i < numProperties; i++) {
            const property = new Property({
                ownerName: faker.person.fullName(),
                propertyId: faker.string.alphanumeric(10).toUpperCase(),
                taxId: faker.string.numeric(8),
                propertyType: faker.helpers.arrayElement(PROPERTY_TYPES),
                value: faker.number.int({ min: 50000, max: 500000 }),
                ward: faker.string.numeric(2),
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.helpers.arrayElement(CITIES),
                    state: "Maharashtra",
                    zipCode: faker.location.zipCode(),
                    country: "India"
                },
                status: faker.helpers.arrayElement(['active', 'inactive', 'disputed'])
            });
            properties.push(await property.save());
        }

        // 3. Generate Tax Records with 40/40/20 Distribution
        const numRecords = 50;
        let counts = { paid: 0, pending: 0, overdue: 0 };

        for (let i = 0; i < numRecords; i++) {
            const property = faker.helpers.arrayElement(properties);
            
            // Randomly pick a status according to the requested distribution
            const roll = Math.random();
            let status;
            if (roll < 0.4) {
                status = 'paid';
                counts.paid++;
            } else if (roll < 0.8) {
                status = 'pending';
                counts.pending++;
            } else {
                status = 'overdue';
                counts.overdue++;
            }

            const taxAmount = faker.number.int({ min: 1000, max: 10000 });
            const dueDate = status === 'overdue' ? faker.date.past() : faker.date.future();

            await new TaxRecord({
                propertyId: property._id,
                taxYear: faker.helpers.arrayElement(['2022', '2023', '2024']),
                taxAmount,
                taxRate: faker.number.int({ min: 3, max: 5 }),
                dueDate,
                paymentStatus: status,
                isDefaulter: (status === 'overdue'),
                remainingAmount: (status === 'paid' || status === 'waived') ? 0 : taxAmount
            }).save();
        }

        // 4. Summarize and Print
        const cityStats = await Property.aggregate([
            { $group: { _id: "$address.city", count: { $sum: 1 } } }
        ]);

        console.log("\n🚀 SEEDING SUMMARY:");
        console.log("-------------------");
        console.log(`🏠 Properties Created: ${numProperties}`);
        console.log(`💰 Tax Records Created: ${numRecords}`);
        console.log("\n📍 Property Distribution by City:");
        cityStats.forEach(stat => console.log(` - ${stat._id}: ${stat.count}`));
        console.log("\n⚖️ Tax Record Status Distribution:");
        console.log(` - Paid: ${counts.paid} (${Math.round((counts.paid/numRecords)*100)}%)`);
        console.log(` - Pending: ${counts.pending} (${Math.round((counts.pending/numRecords)*100)}%)`);
        console.log(` - Overdue: ${counts.overdue} (${Math.round((counts.overdue/numRecords)*100)}%)`);

        console.log("\nDatabase seeding completed!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedDatabase();

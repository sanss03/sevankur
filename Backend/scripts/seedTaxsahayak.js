const mongoose = require('mongoose');
const Property = require('../models/Property');
const TaxRecord = require('../models/TaxRecord');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const taxsahayakRecords = [
  { owner: "Dattatreya Deshpande", propertyId: "MHB-2024-001", ward: "A/12", amountDue: 14500, state: "Maharashtra", city: "Solapur" },
  { owner: "Sunita Rao", propertyId: "MHB-2024-042", ward: "B/04", amountDue: 8200, state: "Maharashtra", city: "Solapur" },
  { owner: "Vijay Chauhan", propertyId: "MHB-2024-089", ward: "A/12", amountDue: 21000, state: "Maharashtra", city: "Solapur" },
  { owner: "Meera Kulkarni", propertyId: "MHB-2024-112", ward: "C/18", amountDue: 5400, state: "Maharashtra", city: "Solapur" },
  { owner: "Rajesh Gaikwad", propertyId: "MHB-2024-205", ward: "A/12", amountDue: 12800, state: "Maharashtra", city: "Solapur" }
];

async function seedTaxsahayak() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    // Clear existing
    // await Property.deleteMany({});
    // await TaxRecord.deleteMany({});

    for (const record of taxsahayakRecords) {
      // Create Property
      const prop = await Property.create({
        ownerName: record.owner,
        propertyId: record.propertyId,
        taxId: "T-" + record.propertyId,
        propertyType: "residential",
        value: record.amountDue * 10,
        ward: record.ward,
        address: {
          street: "Taxsahayak Colony",
          city: record.city,
          state: record.state,
          zipCode: "41300" + Math.floor(Math.random()*9),
          country: "India"
        },
        status: "active"
      });

      // Create TaxRecord
      await TaxRecord.create({
        propertyId: prop._id,
        taxYear: "2024-25",
        taxAmount: record.amountDue,
        taxRate: 1.2,
        dueDate: new Date("2025-03-31"),
        paymentStatus: record.amountDue > 10000 ? "pending" : "paid",
        isDefaulter: record.amountDue > 10000,
        remainingAmount: record.amountDue > 10000 ? record.amountDue : 0
      });
    }

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seedTaxsahayak();

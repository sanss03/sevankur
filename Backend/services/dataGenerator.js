const { faker } = require('@faker-js/faker');

function extractRanges(context) {
    let minAmount = 1000;
    let maxAmount = 50000;
    
    if (context) {
        // Try to identify numbers that likely represent tax amounts (e.g. 500 to 500000)
        const numbers = (context.match(/\b\d{4,6}\b/g) || []).map(Number).filter(n => n > 500 && n < 500000);
        if (numbers.length >= 2) {
            minAmount = Math.min(...numbers);
            maxAmount = Math.max(...numbers);
        }
    }
    return { minAmount, maxAmount };
}

function generateDummyData(context) {
    const { minAmount, maxAmount } = extractRanges(context);
    const data = [];
    
    // Generate realistic data array based on context limits
    for(let i = 0; i < 150; i++) {
        let statusRoll = Math.random();
        let status = statusRoll > 0.6 ? "paid" : (statusRoll > 0.3 ? "pending" : "Defaulter");
        
        let amountDue = status === "paid" ? 0 : faker.number.int({ min: minAmount, max: maxAmount });
        
        data.push({
            owner: faker.person.fullName(),
            ward: faker.number.int({ min: 1, max: 5 }),
            amountDue: amountDue,
            status: status
        });
    }

    // TASK 10: LOGGING
    console.log("Generated data from docs:", data.length);
    return data;
}

module.exports = { generateDummyData };

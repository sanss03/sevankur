const axios = require('axios');

async function testRouting() {
  const tests = [
    { name: "GREETING", message: "hey" },
    { name: "DATA", message: "show ward 4 defaulters" },
    { name: "DOCUMENT", message: "what is property tax rule" },
    { name: "GENERAL", message: "can you tell me a joke?" }
  ];

  for (const test of tests) {
    console.log(`\nTesting ${test.name}: "${test.message}"`);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: test.message });
      console.log('Bot:', res.data.text);
      if (res.data.data) {
        console.log('Data returned:', res.data.data.length, 'records');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

testRouting();

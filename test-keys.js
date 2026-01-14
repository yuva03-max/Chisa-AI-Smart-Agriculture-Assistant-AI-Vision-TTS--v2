require('dotenv').config();
const axios = require('axios');

async function testKey(name, key, model) {
    console.log(`Testing ${name}...`);
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: model,
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 10
        }, {
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            }
        });
        console.log(`${name} SUCCESS:`, response.data.choices[0].message.content);
    } catch (error) {
        console.error(`${name} FAILED:`, error.response ? error.response.data : error.message);
    }
}

async function run() {
    await testKey('PRIMARY_KEY', process.env.OPENROUTER_API_KEY, process.env.PRIMARY_MODEL);
    await testKey('MARKET_KEY', process.env.OPENROUTER_MARKET_API_KEY, process.env.MARKET_MODEL);
}

run();

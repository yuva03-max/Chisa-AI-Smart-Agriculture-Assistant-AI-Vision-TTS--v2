const axios = require('axios');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

    try {
        const { crop, region, district } = JSON.parse(event.body);
        const userPrompt = `Fetch or simulate market prices for ${crop || 'crops'} in ${district || region || 'local region'}. Provide trends and outlook.`;
        const systemPrompt = "You are a Market Price Analyst. Provide trends, predictions, and outlooks. Label estimates clearly. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context. Avoid futuristic, creative, or non-practical responses.";

        const GROQ_API_KEY = "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";

        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ...response.data, function: "Market Prices" }) };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: error.message } }) };
    }
};




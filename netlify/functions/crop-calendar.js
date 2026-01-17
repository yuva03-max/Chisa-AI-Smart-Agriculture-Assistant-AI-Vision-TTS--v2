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
        const { crop, location, season } = JSON.parse(event.body);
        const userPrompt = `Generate a crop calendar for ${crop} in ${location || 'local region'} during ${season || 'current season'}.`;
        const systemPrompt = "You are an Expert AI Crop Calendar Generator. Include sowing, growth, irrigation phases, fertilization, and harvest timing. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context. Avoid futuristic, creative, or non-practical responses.";

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

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ...response.data, function: "Crop Calendar" }) };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: error.message } }) };
    }
};



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
        const { crop, growth_stage, climate } = JSON.parse(event.body);
        const userPrompt = `Recommend irrigation schedule for ${crop} at ${growth_stage} stage. Climate: ${climate || 'Not specified'}.`;
        const systemPrompt = "You are an Irrigation Management Expert. Recommend schedules, promote water efficiency, and explain reasoning. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context. Avoid futuristic, creative, or non-practical responses.";

        const GROQ_API_KEY = "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";

        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.3-70b-versatile",
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

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ...response.data, function: "Irrigation Management" }) };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: error.message } }) };
    }
};

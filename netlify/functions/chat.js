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
        const { system_prompt, user_prompt } = JSON.parse(event.body);

        // Reject market price queries
        const isMarketRequest = system_prompt && (
            system_prompt.includes('market analyst') ||
            user_prompt.toLowerCase().includes('price') ||
            user_prompt.toLowerCase().includes('mandi') ||
            user_prompt.toLowerCase().includes('market')
        );

        if (isMarketRequest) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: 'Market price queries are not supported.' } }) };
        }

        // Enhanced system prompt
        const enhancedSystemPrompt = (system_prompt || "You are a helpful agricultural assistant.") +
            " Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context. Avoid futuristic, creative, or non-practical responses.";

        const GROQ_API_KEY = "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";

        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "system", content: enhancedSystemPrompt },
                { role: "user", content: user_prompt }
            ],
            max_tokens: 1500,
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(response.data) };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: error.message } }) };
    }
};




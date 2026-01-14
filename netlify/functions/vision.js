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
        const { image, system_prompt } = JSON.parse(event.body);
        if (!image) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: { message: 'Image data is required' } }) };

        // Enhanced system prompt
        const enhancedSystemPrompt = (system_prompt || "Analyze this plant image.") +
            " Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context. Avoid futuristic, creative, or non-practical responses.";

        const GROQ_API_KEY = "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";

        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: "llama-3.2-11b-vision-preview",
            messages: [
                { role: "system", content: enhancedSystemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "image_url", image_url: { url: image } }
                    ]
                }
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

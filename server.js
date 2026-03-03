const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Groq API Configuration
const GROQ_API_KEY = "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";
const PRIMARY_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Weather API Configuration
const OPENWEATHER_API_KEY = "500889e3ed8865441bbfb67e99b9a412";

// Helper for Groq API requests
async function callGroq(messages, model, apiKey) {
    if (!apiKey) {
        throw new Error('Groq API Key is not configured. Please add your API key in server.js');
    }
    try {
        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: model,
            messages: messages,
            max_tokens: 1500,
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            timeout: 60000 // 60 second timeout for complex agriculture tasks
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error('Groq Auth Error: 401 Unauthorized. Please check your API key.');
            throw new Error('Invalid Groq API Key. Please update your API key in server.js');
        } else if (error.response && error.response.status === 403) {
            console.error('Groq Auth Error: 403 Forbidden. Check if your account has credits or if the model is restricted.');
            throw new Error('Groq API Forbidden. Check account credits or model restrictions.');
        }
        console.error('Groq API Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

/**
 * 🔹 AI Assistant (PRIMARY_KEY)
 * General agricultural advisory.
 */
app.post('/api/chat', async (req, res) => {
    const { system_prompt, user_prompt } = req.body;

    // Intent Detection: Route market-related queries internally
    const isMarketRequest = (user_prompt && (
        user_prompt.toLowerCase().includes('price') ||
        user_prompt.toLowerCase().includes('mandi') ||
        user_prompt.toLowerCase().includes('market') ||
        user_prompt.toLowerCase().includes('trend') ||
        user_prompt.toLowerCase().includes('prediction')
    ));

    if (isMarketRequest) {
        console.log("Routing to Market Prices logic...");
        return handleMarketPrices(req, res);
    }

    const enhancedSystemPrompt = (system_prompt || "You are an Expert AI Agriculture Assistant.") +
        "\nRules: Provide expert agricultural guidance. Concise, actionable, and practical.";

    try {
        const messages = [
            { role: "system", content: enhancedSystemPrompt },
            { role: "user", content: user_prompt }
        ];
        const response = await callGroq(messages, PRIMARY_MODEL, GROQ_API_KEY);
        res.json({ ...response, function: "AI Assistant" });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

/**
 * 🔹 Plant Vision (PRIMARY_KEY)
 * Image-based crop analysis.
 */
app.post('/api/vision', async (req, res) => {
    const { image, system_prompt } = req.body;
    if (!image) return res.status(400).json({ error: { message: 'Image data is required' } });

    const enhancedSystemPrompt = (system_prompt || "Analyze this crop image.") +
        "\nRules: Identify crop type, growth stage, disease, pests, and nutrient deficiencies. Provide treatment recommendations.";

    try {
        const messages = [
            { role: "system", content: enhancedSystemPrompt },
            {
                role: "user",
                content: [
                    { type: "image_url", image_url: { url: image } }
                ]
            }
        ];
        const response = await callGroq(messages, VISION_MODEL, GROQ_API_KEY);
        res.json({ ...response, function: "Plant Vision" });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

/**
 * 🔹 Crop Calendar (PRIMARY_KEY)
 */
app.post('/api/crop-calendar', async (req, res) => {
    const { crop, location, season } = req.body;
    const userPrompt = `Generate a crop calendar for ${crop} in ${location || 'local region'} during ${season || 'current season'}.`;
    const systemPrompt = "You are an Expert AI Crop Calendar Generator. Include sowing, growth, irrigation phases, fertilization, and harvest timing. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context.";

    try {
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
        const response = await callGroq(messages, PRIMARY_MODEL, GROQ_API_KEY);
        res.json({ ...response, function: "Crop Calendar" });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

/**
 * 🔹 Irrigation Management (PRIMARY_KEY)
 */
app.post('/api/irrigation', async (req, res) => {
    const { crop, growth_stage, climate } = req.body;
    const userPrompt = `Recommend irrigation schedule for ${crop} at ${growth_stage} stage. Climate: ${climate || 'Not specified'}.`;
    const systemPrompt = "You are an Irrigation Management Expert. Recommend schedules, promote water efficiency, and explain reasoning. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context.";

    try {
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
        const response = await callGroq(messages, PRIMARY_MODEL, GROQ_API_KEY);
        res.json({ ...response, function: "Irrigation Management" });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
});

/**
 * 🔹 Market Prices (MARKET_KEY)
 */
async function handleMarketPrices(req, res) {
    const { crop, region, district } = req.body;
    const userPrompt = `Fetch or simulate market prices for ${crop || 'crops'} in ${district || region || 'local region'}. Provide trends and outlook.`;
    const systemPrompt = "You are a Market Price Analyst. Provide trends, predictions, and outlooks. Label estimates clearly. Keep responses simple, clear, and farmer-friendly. Prefer step-by-step explanations when needed. Focus on Indian agriculture context.";

    try {
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];
        const response = await callGroq(messages, PRIMARY_MODEL, GROQ_API_KEY);
        res.json({ ...response, function: "Market Prices" });
    } catch (error) {
        res.status(500).json({ error: { message: error.message } });
    }
}

app.post('/api/market-prices', handleMarketPrices);

// Weather Proxies
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        res.json(response.data);
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({ error: { message: 'Failed to fetch weather data' } });
    }
});

app.get('/api/forecast', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        res.json(response.data);
    } catch (error) {
        console.error('Forecast API Error:', error.message);
        res.status(500).json({ error: { message: 'Failed to fetch forecast data' } });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});

module.exports = app;









// Netlify Function: Forecast API (OpenWeatherMap 5-Day)
const https = require('https');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const WEATHER_API_KEY = "500889e3ed8865441bbfb67e99b9a412";

    try {
        const { lat, lon } = event.queryStringParameters || {};

        if (!lat || !lon) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: { message: 'lat and lon parameters are required' } })
            };
        }

        const path = `/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await makeGetRequest('api.openweathermap.org', path);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: response
        };
    } catch (error) {
        console.error('Forecast API Error:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: { message: error.message || 'Internal server error' } })
        };
    }
};

function makeGetRequest(host, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: host,
            path: path,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
        req.end();
    });
}

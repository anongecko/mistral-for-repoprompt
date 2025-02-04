const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Received request body:', JSON.stringify(req.body));
        console.log('Received headers:', JSON.stringify(req.headers));

        // Forward the request to Mistral
        const response = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            validateStatus: false // Don't throw on non-2xx responses
        });

        console.log('Mistral response status:', response.status);
        console.log('Mistral response headers:', JSON.stringify(response.headers));

        // Return Mistral's response with same status code
        return res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        return res.status(500).json({
            error: {
                message: 'Internal server error',
                details: error.message,
                status: error.response?.status,
                data: error.response?.data
            }
        });
    }
};


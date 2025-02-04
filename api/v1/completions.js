import axios from 'axios';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Forward the request to Mistral
        const response = await axios.post(
            'https://codestral.mistral.ai/v1/fim/completions',
            req.body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                }
            }
        );

        // Return Mistral's response
        return res.status(200).json(response.data);
    } catch (error) {
        // Forward error response
        return res.status(error.response?.status || 500).json({
            error: {
                message: error.message,
                ...error.response?.data
            }
        });
    }
}


const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('OpenAI-Version', '2020-10-01');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            "object": "list",
            "data": [
                {
                    "id": "text-davinci-003",
                    "object": "model",
                    "created": 1669599635,
                    "owned_by": "openai-internal",
                    "permission": [],
                    "root": "text-davinci-003",
                    "parent": null
                }
            ]
        });
    }

    return res.status(405).json({
        error: {
            message: 'Method not allowed',
            type: 'invalid_request_error',
            param: null,
            code: null
        }
    });
};


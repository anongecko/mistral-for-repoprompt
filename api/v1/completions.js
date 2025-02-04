const axios = require('axios');

module.exports = async (req, res) => {
    // Add OpenAI-style headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('OpenAI-Version', '2020-10-01');
    res.setHeader('OpenAI-Organization', 'dummy-org');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: {
                message: 'Method not allowed',
                type: 'invalid_request_error',
                param: null,
                code: null
            }
        });
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: {
                ...req.body,
                // Ensure we have these fields
                stream: false,
                echo: false
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            validateStatus: false
        });

        // Ensure response matches OpenAI format exactly
        const formattedResponse = {
            id: response.data.id || `chatcmpl-${Date.now()}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: req.body.model || 'mistral-medium',
            choices: response.data.choices.map(choice => ({
                text: choice.message.content,
                index: choice.index,
                logprobs: null,
                finish_reason: choice.finish_reason
            })),
            usage: response.data.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };

        return res.status(200).json(formattedResponse);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: {
                message: 'Internal server error',
                type: 'internal_server_error',
                param: null,
                code: null
            }
        });
    }
};

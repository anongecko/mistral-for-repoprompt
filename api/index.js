const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Models endpoint
app.get('/models', async (req, res) => {
    res.json({
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
});

// Completions endpoint
app.post('/v1/completions', async (req, res) => {
    try {
        const mistralResponse = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            }
        });

        res.json({
            id: `cmpl-${Date.now()}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: 'text-davinci-003',
            choices: [{
                text: mistralResponse.data.choices[0].message.content,
                index: 0,
                logprobs: null,
                finish_reason: mistralResponse.data.choices[0].finish_reason
            }],
            usage: mistralResponse.data.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: {
                message: 'An error occurred during your request.',
                type: 'internal_server_error'
            }
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'healthy' });
});

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

module.exports = app;

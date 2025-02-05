const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Move models endpoint to base URL
app.get('/models', (req, res) => {
    res.json({
        object: "list",
        data: [{
            id: "text-davinci-003",
            object: "model",
            created: 1669599635,
            owned_by: "openai-internal"
        }]
    });
});

// Completions endpoint now directly under /v1/
app.post('/completions', async (req, res) => {
    try {
        const mistralResponse = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: {
                ...req.body,
                model: "codestral-latest"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            }
        });

        const formattedResponse = {
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
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({
            error: {
                message: error.response?.data?.error?.message || 'Internal server error',
                type: 'api_error'
            }
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;


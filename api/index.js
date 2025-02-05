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

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

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

app.post('/v1/completions', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);

        const mistralResponse = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: {
                ...req.body,
                model: "codestral-latest"  // Force Mistral model
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            }
        });

        console.log('Mistral response:', mistralResponse.data);

        const formattedResponse = {
            id: `cmpl-${Date.now()}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: req.body.model || 'text-davinci-003',
            choices: [{
                text: mistralResponse.data.choices[0].message.content,
                index: 0,
                logprobs: null,
                finish_reason: "stop"
            }],
            usage: mistralResponse.data.usage || {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };

        console.log('Formatted response:', formattedResponse);
        res.json(formattedResponse);

    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });

        res.status(error.response?.status || 500).json({
            error: {
                message: error.response?.data?.error?.message || error.message,
                type: 'api_error',
                code: error.response?.status
            }
        });
    }
});

module.exports = app;

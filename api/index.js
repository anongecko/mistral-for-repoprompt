const express = require('express');
const axios = require('axios');
const app = express();

// Basic error logging
const logError = (err, location) => {
    console.error(`Error in ${location}:`, {
        message: err.message,
        stack: err.stack,
        details: err.response?.data
    });
};

// Middleware
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

// Basic health check
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

// Models endpoint
app.get('/models', (req, res) => {
    try {
        res.json({
            object: "list",
            data: [{
                id: "text-davinci-003",
                object: "model",
                created: 1669599635,
                owned_by: "openai-internal"
            }]
        });
    } catch (err) {
        logError(err, 'models');
        res.status(500).json({ error: 'Internal server error' });
    }
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
            usage: mistralResponse.data.usage
        });
    } catch (err) {
        logError(err, 'completions');
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = app;

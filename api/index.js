// File: api/index.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

async function handleCompletions(req, res) {
    try {
        const mistralResponse = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: {
                ...req.body,
                model: "codestral-latest",
                stream: req.body.stream || false
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            ...(req.body.stream ? { responseType: 'stream' } : {})
        });

        if (req.body.stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            mistralResponse.data.pipe(res);
        } else {
            const formattedResponse = {
                id: `cmpl-${Date.now()}`,
                object: 'text_completion',
                created: Math.floor(Date.now() / 1000),
                model: req.body.model || 'text-davinci-003',
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
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            error: {
                message: error.response?.data?.error?.message || 'Internal server error',
                type: 'api_error'
            }
        });
    }
}

async function handleChatCompletions(req, res) {
    try {
        const mistralResponse = await axios({
            method: 'post',
            url: 'https://codestral.mistral.ai/v1/fim/completions',
            data: {
                ...req.body,
                model: "codestral-latest",
                stream: req.body.stream || false,
                ...(req.body.messages ? {
                    prompt: req.body.messages.map(msg => 
                        `${msg.role}: ${msg.content}`).join('\n')
                } : {})
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization
            },
            ...(req.body.stream ? { responseType: 'stream' } : {})
        });

        if (req.body.stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            mistralResponse.data.pipe(res);
        } else {
            const formattedResponse = {
                id: `chatcmpl-${Date.now()}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: req.body.model || 'text-davinci-003',
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: mistralResponse.data.choices[0].message.content
                    },
                    finish_reason: mistralResponse.data.choices[0].finish_reason
                }],
                usage: mistralResponse.data.usage || {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0
                }
            };
            res.json(formattedResponse);
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            error: {
                message: error.response?.data?.error?.message || 'Internal server error',
                type: 'api_error'
            }
        });
    }
}

// Models endpoints - both at root and v1 for compatibility
app.get('/v1/models', (req, res) => {
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

// Regular completions endpoints
app.post('/v1', handleCompletions);
app.post('/v1/completions', handleCompletions);

// Chat completions endpoints
app.post('/chat/completions', handleChatCompletions);
app.post('/chat', handleChatCompletions);
app.post('/v1/chat/completions', handleChatCompletions);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;

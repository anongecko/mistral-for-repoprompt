const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
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
        const isStreamRequest = req.body.stream === true;
        console.log('Stream request:', isStreamRequest);

        if (isStreamRequest) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const mistralResponse = await axios({
                method: 'post',
                url: 'https://codestral.mistral.ai/v1/fim/completions',
                data: {
                    ...req.body,
                    model: "codestral-latest",
                    stream: true
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                },
                responseType: 'stream'
            });

            mistralResponse.data.pipe(res);
            mistralResponse.data.on('end', () => {
                res.end();
            });
        } else {
            const mistralResponse = await axios({
                method: 'post',
                url: 'https://codestral.mistral.ai/v1/fim/completions',
                data: {
                    ...req.body,
                    model: "codestral-latest",
                    stream: false
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
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json({
            error: {
                message: error.response?.data?.error?.message || 'Internal server error',
                type: 'api_error'
            }
        });
    }
}

// Models endpoint at root level
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

// Handle completions with and without trailing slashes
app.post('/v1/', handleCompletions);  // With trailing slash
app.post('/v1', handleCompletions);   // Without trailing slash

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;

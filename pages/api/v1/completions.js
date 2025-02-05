const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('OpenAI-Version', '2020-10-01');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
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

            return res.status(200).json(formattedResponse);

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                    type: 'internal_server_error',
                    param: null,
                    code: null
                }
            });
        }
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

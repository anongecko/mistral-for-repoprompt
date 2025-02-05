import axios from 'axios';

export default async function handler(req, res) {
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

            return res.status(200).json({
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
            return res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                    type: 'internal_server_error'
                }
            });
        }
    }
    return res.status(405).json({ error: 'Method not allowed' });
}

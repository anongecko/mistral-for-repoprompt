export default async function handler(req, res) {
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
    return res.status(405).json({ error: 'Method not allowed' });
}

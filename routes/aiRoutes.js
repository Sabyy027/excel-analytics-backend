const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const HF_API_TOKEN = process.env.HF_API_TOKEN;

router.post('/summarize-data', protect, async (req, res) => {
    try {
        const { data, fileName } = req.body;
        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'No data provided for summarization.' });
        }

        const sampleData = data.slice(0, 1); // Use only 1 row for fastest response
        const textToSummarize = `Sample from "${fileName}":\n` + JSON.stringify(sampleData, null, 2);

        const hfResponse = await axios.post(
            'https://api-inference.huggingface.co/models/falconsai/text_summarization',
            { inputs: textToSummarize },
            { headers: { Authorization: `Bearer ${HF_API_TOKEN}` }, timeout: 30000 }
        );

        let summary = 'No summary returned.';
        if (Array.isArray(hfResponse.data) && hfResponse.data[0]?.summary_text) {
            summary = hfResponse.data[0].summary_text;
        } else if (hfResponse.data?.data && Array.isArray(hfResponse.data.data) && hfResponse.data.data[0]?.generated_text) {
            summary = hfResponse.data.data[0].generated_text;
        } else if (hfResponse.data?.generated_text) {
            summary = hfResponse.data.generated_text;
        }
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error with Hugging Face API:', error.response?.data || error.message);
        res.status(500).json({ message: 'Error generating summary', error: error.message });
    }
});

module.exports = router; 
import express from 'express';
import cors from 'cors';
import OpenAI from "openai";
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI();

app.post('/translate', async (req, res) => {
    const { text, target_lang } = req.body;
    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
            },
            body: JSON.stringify({
                text: text,
                target_lang: target_lang
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Failed to translate:', error);
        res.status(500).json({ message: "Failed to translate" });
    }
});

app.post('/chat', async (req, res) => {
    const { langue, phrase } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system", content: `Hello, I need the analysis of the sentence in ${langue} (response required in ${langue}) to be formatted only with essential HTML content tags such as <strong>, <p>, <ul>, <li>, and <h2>. Please avoid including any full HTML document structure like <!DOCTYPE>, <html>, <head>, or <body> tags. Focus the explanation using HTML tags to clearly highlight translations, grammar rules, and meanings directly. Sentence: "${phrase}"`
            }],
            model: "gpt-4o-mini",
        });
        res.json(completion.choices[0]);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ message: "Failed to interact with ChatGPT" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

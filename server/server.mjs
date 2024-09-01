import express from 'express';
import cors from 'cors';
import OpenAI from "openai";
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from "path";
import fs from "fs";
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

app.post('/tts', async (req, res) => {
    try {
        const { input, voice = 'fable', model = 'tts-1' } = req.body;
        const response = await openai.audio.speech.create({
            model: model,
            voice: voice,
            input: input,
        });

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (error) {
        console.error('Error generating speech:', error);
        res.status(500).json({ message: 'Failed to generate speech', error: error.message });
    }
})

app.post('/chat', async (req, res) => {
    const { originLang, targetLang, phrase } = req.body;
    const prompt = `Hello, I need the analysis of the sentence in ${targetLang}(response required in ${originLang}) to be formatted only with essential HTML content tags such as <strong>, <p>, <ul>, <li>, and <h2>. Please avoid including any full HTML document structure like <!DOCTYPE>, <html>, <head>, or <body> tags. Focus the explanation using HTML tags to clearly highlight translations, grammar rules, and meanings directly. Sentence: "${phrase}"

`
    console.log(prompt);
    try {
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system",
                content: prompt
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

// server.js
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

import Document from './models/Document.js'; // keep .js in ESM
import extractTextFromFile, { splitIntoChunks } from './utils/textExtractor.js';
// import { askOllama } from './utils/ollamaClient.js';

dotenv.config();

const app = express();
const PORT = 5000;



app.use(cors({
  origin: 'http://localhost:3000', // 👈 Full protocol required
  credentials: true                // Optional: needed if sending cookies/auth
}));

app.use(express.json()); // 👈 This enables JSON parsing
app.use(express.urlencoded({ extended: true }));


console.log(process.env.OPENAI_API_KEY); // optional debug

// MongoDB
mongoose.connect('mongodb+srv://sagarsingh030601:sagar@1234@cluster0.yk04jps.mongodb.net/AiPdf', {
  // these options are not needed in Mongoose 8+
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

async function summarizeChunk(chunk) {
  const prompt = `Summarize this document chunk and extract key points:\n\n${chunk}`;
  try {
    const res = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama2',
      messages: [
        // { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      stream: false
    });

    console.log('Full API response:', JSON.stringify(res.data, null, 2));
    return res.data?.message?.content || '';
  } catch (err) {
    console.error('Error summarizing chunk:', err);
    return '';
  }
}


async function summarizeLargeDocument(documentText) {
  const chunks = splitIntoChunks(documentText);
  const summaries = [];

  for (const chunk of chunks) {
    const summary = await summarizeChunk(chunk);
    summaries.push(summary);
  }

  return summaries.join('\n\n');
}


// Upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const textContent = await extractTextFromFile(filePath);
    console.log("textContent", textContent);

    const prompt = `Summarize this document and extract key points:\n\n${textContent}`;
    // const responseText = await askOllama(prompt);
    const responseText = await summarizeLargeDocument(textContent);

    console.log("responseText", responseText);


    const doc = new Document({
      filename: req.file.originalname,
      summary: responseText,
      fullText: textContent,
    });

    await doc.save();
    res.status(200).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

// Document summary fetch
app.post('/api/document/:id/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const prompt = `Answer the following question based on this document:\n${doc.fullText}\n\nQuestion: ${question}`;


    // Use llama2 via Ollama
    const result = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama2',
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false
    });

    console.log("result", result)

    const answer = result.data?.message?.content || "No answer received.";
    res.status(200).json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});


// Ask questions
app.post('/api/document/:id/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const doc = await Document.findById(req.params.id);
    const prompt = `Answer the following question based on this document:\n${doc.fullText}\n\nQuestion: ${question}`;
    // const answer = await askOllama(prompt);
    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


export default app;

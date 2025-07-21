// 📁 server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const OpenAI = require('openai');
const dotenv = require('dotenv');

const Document = require('./models/Document'); // remove `.js`
const extractTextFromFile = require('./utils/textExtractor');

dotenv.config();

const app = express();
const PORT = 5000;

// 🔐 OpenAI Config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

// 📦 MongoDB Connection
mongoose.connect('mongodb+srv://sagarsingh030601:<9867589566>@cluster0.yk04jps.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 📁 Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// 📌 Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const textContent = await extractTextFromFile(filePath);

    const prompt = `Summarize this document and extract key points:\n\n${textContent}`;

    const aiRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = aiRes.choices[0].message.content;

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

// 📌 Get Document Summary
app.get('/api/document/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// 📌 Ask Question About Document
app.post('/api/document/:id/ask', async (req, res) => {
  const { question } = req.body;
  try {
    const doc = await Document.findById(req.params.id);
    const prompt = `Answer the following question based on this document:\n${doc.fullText}\n\nQuestion: ${question}`;

    const aiRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    res.status(200).json({ answer: aiRes.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

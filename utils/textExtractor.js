// 📁 utils/textExtractor.js
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const extractTextFromFile = async (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === 'docx') {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === 'txt') {
    return fs.readFileSync(filePath, 'utf8');
  }

  throw new Error('Unsupported file type');
};

module.exports = extractTextFromFile;

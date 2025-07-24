import fs from 'fs';
import mammoth from 'mammoth';
import pdfjsLib from 'pdfjs-dist/build/pdf.js';

// Extract PDF text
const extractTextFromPDF = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n';
  }

  return text;
};

// Extract based on file type
const extractTextFromFile = async (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'pdf') return await extractTextFromPDF(filePath);
  if (ext === 'docx') {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (ext === 'txt') return fs.readFileSync(filePath, 'utf8');

  throw new Error('Unsupported file type');
};

// Split into prompt-safe chunks
function splitIntoChunks(text, chunkSize = 3000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export default extractTextFromFile;
export { splitIntoChunks };

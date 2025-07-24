// utils/ollamaClient.js
import axios from 'axios';

export async function askOllama(prompt) {
  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama2',
      prompt,
      stream: false
    });

    // ✅ FIX: Properly access nested message content
    const message = response.data?.message?.content || '';
    return message.trim(); // remove any excessive whitespace
  } catch (error) {
    console.error('❌ Error calling Ollama:', error.message);
    throw error;
  }
}

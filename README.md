# AiPdf


# WORKIMG

1.Docker Maps the local port 11434 to itself where Ai model is running .
2.Ngrox makes the port public.So now model is publically accessiable 
3.Server hosted on render hits the api which its ngrox live link.


🟩 1. Ngrok exposes your local Express server
You run:

bash
Copy
Edit
ngrok http 5000
Ngrok creates a public HTTPS URL like:

arduino
Copy
Edit
https://abc123.ngrok.io
Now anyone can access your Node.js server through that URL.

✅ This does not expose Docker directly — only your server.

🟧 2. Client uploads PDF to your server (via Ngrok)
The frontend sends a POST request to:

bash
Copy
Edit
https://abc123.ngrok.io/api/upload
That hits your Express backend running locally on port 5000.

🟨 3. Server receives file, extracts text
You use multer to store the uploaded PDF.

You run extractTextFromFile() and then split the text using splitIntoChunks().

🟥 4. Server talks to Ollama (inside Docker)
Your Express server sends an HTTP POST request to the Ollama model:

js
Copy
Edit
const MODEL_API = process.env.MODEL_API || "http://localhost:11434";
This works because:

Docker maps port 11434 to your host machine

So when your Node app (outside Docker) hits http://localhost:11434, it reaches Ollama inside Docker

✅ Your model is not accessible from the public internet
✅ But your server can access it locally

🟦 5. Ollama returns summary
Ollama (TinyLlama) processes the prompt chunk and returns the result.

Your server collects all chunk summaries into one final summary.

🟪 6. Server saves result to MongoDB Atlas
MongoDB Atlas is cloud-hosted, so your server connects via internet to:

perl
Copy
Edit
mongodb+srv://...@cluster0.mongodb.net
You save:

Filename

Summary

Full text

🟫 7. Client sees the result
Frontend hits another route (maybe /api/documents/:id) to get summary

You optionally expose that route via Ngrok too


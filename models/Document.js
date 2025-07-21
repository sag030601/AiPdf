
// 📁 models/Document.js
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  filename: String,
  summary: String,
  fullText: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Document', DocumentSchema);


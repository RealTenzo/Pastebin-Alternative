require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pastebin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Paste model
const Paste = mongoose.model('Paste', {
  id: String,
  content: String,
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// API Routes
app.post('/api/pastes', async (req, res) => {
  try {
    const { content, name } = req.body;
    const id = crypto.randomBytes(8).toString('hex');
    const paste = new Paste({
      id,
      content,
      name: name || 'unnamed'
    });
    await paste.save();
    res.json({ id, name: paste.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pastes/:id', async (req, res) => {
  try {
    const paste = await Paste.findOne({ id: req.params.id });
    if (!paste) return res.status(404).json({ error: 'Paste not found' });
    res.json(paste);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pastes/:id', async (req, res) => {
  try {
    const { content, name } = req.body;
    const paste = await Paste.findOneAndUpdate(
      { id: req.params.id },
      { content, name, updatedAt: Date.now() },
      { new: true }
    );
    if (!paste) return res.status(404).json({ error: 'Paste not found' });
    res.json(paste);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

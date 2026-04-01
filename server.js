const express = require('express');
const path = require('path');
const { getSessionMiddleware, setupAuthRoutes, requireAuth } = require('./auth');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(getSessionMiddleware());

setupAuthRoutes(app);

app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }
  const { model, contents, systemInstruction } = req.body;
  const allowedModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  if (!model || !allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Invalid or unsupported model.' });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to contact Gemini API.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/app', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher.html'));
});

app.use(express.static(path.join(__dirname)));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend directory path
const frontendPath = path.join(__dirname, '..', 'frontend');

// Serve static files (CSS, JS, assets)
app.use(express.static(frontendPath));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(frontendPath, 'onboarding.html'));
});

app.get('/roadmap-detail', (req, res) => {
  res.sendFile(path.join(frontendPath, 'roadmap-detail.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

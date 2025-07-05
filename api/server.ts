const express = require('express');
const path = require('path');
const createServer = require('vercel-node-server');

const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

module.exports = createServer(app);

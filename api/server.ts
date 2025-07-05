const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

module.exports = serverless(app);

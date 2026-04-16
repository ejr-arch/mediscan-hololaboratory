const http = require('http');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const VECTEEZY_API_KEY = process.env.VECTEEZY_API_KEY || '';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'home.html' : req.url);
  
  // API endpoint for config
  if (req.url === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ GEMINI_API_KEY, VECTEEZY_API_KEY }));
    return;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'home.html'), (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            let html = content.toString();
            html = html.replace(/const GEMINI_API_KEY\s*=\s*""/, `const GEMINI_API_KEY = "${GEMINI_API_KEY}";`);
            html = html.replace(/const VECTEEZY_API_KEY\s*=\s*""/, `const VECTEEZY_API_KEY = "${VECTEEZY_API_KEY}";`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      if (ext === '.html') {
        let html = content.toString();
        html = html.replace(/const GEMINI_API_KEY\s*=\s*""/, `const GEMINI_API_KEY = "${GEMINI_API_KEY}";`);
        html = html.replace(/const VECTEEZY_API_KEY\s*=\s*""/, `const VECTEEZY_API_KEY = "${VECTEEZY_API_KEY}";`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(html);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`MediScan server running at http://localhost:${PORT}`);
});
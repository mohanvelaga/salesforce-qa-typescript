const http = require('node:http');
const port = Number(process.env.MOCK_API_PORT || 8080);

const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200);
      return res.end(JSON.stringify({
        status: 'ok',
        service: 'mock-api'
      }));
    }
    if (req.method === 'POST' && req.url === '/login') {
      let credentials;
      try {
        credentials = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      if (credentials.username === 'qa-user' &&
          credentials.password === 'test-password') {
        res.writeHead(200);
        return res.end(JSON.stringify({ token: 'mock-token' }));
      }

      res.writeHead(401);
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    if (req.method === 'POST' && req.url === '/employees') {
      if (req.headers.authorization !== 'Bearer mock-token') {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }

      let employee;
      try {
        employee = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      if (!employee.name || !employee.role) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'name and role are required' }));
      }

      res.writeHead(201);
      return res.end(JSON.stringify({
        id: 'mock-' + Date.now(),
        name: employee.name,
        role: employee.role
      }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set MOCK_API_PORT to an available port.`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock API listening at http://127.0.0.1:${port}`);
});

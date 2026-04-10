const http = require('http');

const PORT = 8899;

const loginPage = `
<!DOCTYPE html>
<html>
<head><title>Login</title></head>
<body>
  <h1>Login Page</h1>
  <form id="loginForm">
    <input type="text" id="username" placeholder="Username" />
    <input type="password" id="password" placeholder="Password" />
    <button type="submit" id="loginBtn">Login</button>
  </form>
  <script>
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>
`;

// This page has a parser-blocking script that never finishes loading.
// The browser receives the HTTP response (so pageRequestTimeout is satisfied),
// but the <script src="/never-loads"> blocks the HTML parser.
// DOMContentLoaded will NEVER fire because the parser is waiting for the script.
// This means pageLoadTimeout never starts its countdown.
const dashboardPage = `
<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body>
  <h1>Loading Dashboard...</h1>
  <script src="/never-loads"></script>
  <div id="dashboard-content">Welcome to the dashboard</div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.url === '/' || req.url === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(loginPage);
  } else if (req.url === '/dashboard') {
    // Send the full HTML response immediately — pageRequestTimeout is satisfied
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboardPage);
  } else if (req.url === '/never-loads') {
    // This endpoint never responds — the browser's script request hangs forever.
    // The HTML parser is blocked waiting for this script.
    // DOMContentLoaded will never fire.
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    // Intentionally never call res.end() — connection stays open
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Routes:');
  console.log('  /login     - Normal login page (loads fine)');
  console.log('  /dashboard - Page with blocking script (DOMContentLoaded never fires)');
  console.log('  /never-loads - Script endpoint that never responds');
});

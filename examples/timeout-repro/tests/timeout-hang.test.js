import { Selector } from 'testcafe';
import http from 'http';

// ============================================================================
// INT-31: TestCafe Timeout Bug Reproduction
//
// This test proves that ALL TestCafe timeout mechanisms are bypassed when a
// page gets stuck during navigation due to a parser-blocking resource.
//
// Configuration (set via CLI or .sauce/config.yml):
//   pageLoadTimeout:      15,000 ms (15s)
//   pageRequestTimeout:   15,000 ms (15s)
//   ajaxRequestTimeout:   15,000 ms (15s)
//   selectorTimeout:      10,000 ms (10s)
//   assertionTimeout:     10,000 ms (10s)
//   testExecutionTimeout: 30,000 ms (30s)
//
// Expected: Test should fail within 30s (testExecutionTimeout)
// Actual:   Test hangs indefinitely — none of the above timeouts fire
//
// The test is only terminated by the suite-level timeout (2 min), which is
// NOT a TestCafe timeout — it's the runner's wrapper timeout.
// ============================================================================

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

// The dashboard page has a parser-blocking <script> that never finishes loading.
// The browser receives the full HTML (so pageRequestTimeout is satisfied),
// but the HTML parser is blocked waiting for /never-loads to respond.
// DOMContentLoaded will NEVER fire because the parser can't finish.
// TestCafe waits for DOMContentLoaded to signal "page ready" — with no timeout.
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

let server;

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      console.log(`[SERVER] [${new Date().toISOString()}] ${req.method} ${req.url}`);

      if (req.url === '/' || req.url === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(loginPage);
      } else if (req.url === '/dashboard') {
        // Full HTML sent immediately — pageRequestTimeout is satisfied
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboardPage);
      } else if (req.url === '/never-loads') {
        // This endpoint accepts the connection but NEVER sends a response body.
        // The browser's script request hangs forever.
        // The HTML parser is blocked waiting for this script to load.
        // DOMContentLoaded will never fire.
        console.log('[SERVER] /never-loads hit — this request will hang forever (simulating a stalled resource)');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        // Intentionally never call res.end()
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(PORT, () => {
      console.log(`[SERVER] Test server running at http://localhost:${PORT}`);
      console.log('[SERVER] /login      — Normal page (loads fine)');
      console.log('[SERVER] /dashboard  — Page with parser-blocking <script src="/never-loads">');
      console.log('[SERVER] /never-loads — Accepts connection, never responds (simulates stalled resource)');
      resolve();
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

fixture('INT-31 Timeout Reproduction')
  .page(`http://localhost:${PORT}/login`)
  .before(async () => {
    await startServer();
  })
  .after(async () => {
    await stopServer();
  });

test('TestCafe timeouts are bypassed when page navigation stalls', async (t) => {
  const startTime = Date.now();
  console.log('');
  console.log('========================================================');
  console.log('  INT-31: TestCafe Timeout Bug Reproduction');
  console.log('========================================================');
  console.log(`  Configured timeouts:`);
  console.log(`    pageLoadTimeout:      15s`);
  console.log(`    pageRequestTimeout:   15s`);
  console.log(`    ajaxRequestTimeout:   15s`);
  console.log(`    testExecutionTimeout: 30s`);
  console.log(`  Expected: test should fail within 30s`);
  console.log(`  Actual:   test will hang until suite timeout (2 min)`);
  console.log('========================================================');
  console.log('');
  console.log(`[TEST] [${new Date().toISOString()}] Step 1: Login page loaded successfully`);

  // Step 1: Login page loads fine — no issues here
  await t.typeText('#username', 'testuser');
  await t.typeText('#password', 'password123');
  console.log(`[TEST] [${new Date().toISOString()}] Step 2: Filled login form, clicking submit...`);
  console.log(`[TEST] This will navigate to /dashboard which has a parser-blocking script`);

  // Step 2: Click login — navigates to /dashboard
  // The dashboard HTML is served immediately (pageRequestTimeout: satisfied)
  // But it contains <script src="/never-loads"> which blocks the HTML parser
  // DOMContentLoaded never fires → TestCafe never gets the "page ready" signal
  // All TestCafe timeouts freeze at this point
  await t.click('#loginBtn');

  // If we reach this line, the bug is fixed (we won't reach it)
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[TEST] [${new Date().toISOString()}] Navigation completed after ${elapsed}s`);
  console.log(`[TEST] If you see this, the TestCafe bug has been fixed!`);

  // Step 3: This will never execute — TestCafe is stuck waiting for "page ready"
  const dashboard = Selector('#dashboard-content');
  await t.expect(dashboard.exists).ok('Dashboard content should be visible');
  console.log(`[TEST] Dashboard loaded — THIS LINE SHOULD NEVER PRINT`);
});

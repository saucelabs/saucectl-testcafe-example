// A trivial passing test. The point of this example is NOT the test logic — it is
// what happens *before* the test runs: chef must extract the bundled project
// (__project__/app.zip) on the Windows VM. When the bundle contains a file whose
// path exceeds Windows MAX_PATH (260), extraction fails and the job dies with a
// "Sauce Infrastructure Error" before this test ever executes.
const fs = require('fs');
const path = require('path');

// Diagnostic: this test file runs in Node on the VM *after* extraction, so we can
// walk the extracted bundle and log the real path lengths. This surfaces in the
// TestCafe runner output (console.log asset / chef logs) — saucectl itself only
// prints a "longestPathLength" number and never names the offending file.
(function logLongestBundlePath() {
  const projectRoot = path.resolve(__dirname, '..');
  let longest = '';
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (path.relative(projectRoot, full).length > longest.length) {
        longest = path.relative(projectRoot, full);
      }
    }
  };
  try {
    walk(projectRoot);
    const abs = path.join(projectRoot, longest);
    console.log('[maxpath-repro] project root on VM: ' + projectRoot);
    console.log('[maxpath-repro] longest file name:  ' + path.basename(longest) + ' (' + path.basename(longest).length + ' chars)');
    console.log('[maxpath-repro] longest rel path:   ' + longest + ' (' + longest.length + ' chars)');
    console.log('[maxpath-repro] longest abs path:   ' + abs + ' (' + abs.length + ' chars)');
    console.log('[maxpath-repro] Windows MAX_PATH:   260 -> ' + (abs.length > 260 ? 'EXCEEDED' : 'within limit'));
  } catch (e) {
    console.log('[maxpath-repro] failed to scan bundle: ' + e.message);
  }
})();

fixture`maxpath-repro`.page`https://example.com`;

test('smoke - reached the test, so extraction succeeded', async (t) => {
  await t.expect(true).ok();
});

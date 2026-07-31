import { Selector } from 'testcafe';

// Parameterized quiet test for the no-output watchdog.
//
// TestCafe's reporters only print when a test finishes, so during the wait below
// the testcafe process is completely silent on stdout. The runner's watchdog
// (sauce-testrunner-utils runWithStdoutWatchdog) SIGTERMs it once that silence
// exceeds SAUCE_TESTCAFE_NO_PROGRESS_TIMEOUT_SECS, and the saucelabs reporter
// never writes sauce-test-report.json -> job shows "We found no test cases".
//
// Set QUIET_MS per suite to place the silence either side of the window:
//   QUIET_MS < window  -> test completes, suite passes
//   QUIET_MS > window  -> SIGTERM mid-test, suite fails with no test cases
const quietMs = parseInt(process.env.QUIET_MS ?? '240000', 10);

fixture(`Watchdog: quiet for ${quietMs / 1000}s`).page(
    'https://www.saucedemo.com',
);

test(`stays silent for ${quietMs / 1000}s`, async (t) => {
    await t.wait(quietMs);
    await t.expect(Selector('#user-name').exists).ok();
});

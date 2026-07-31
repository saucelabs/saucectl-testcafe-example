import { Selector } from 'testcafe';

// Simulates a long-running test that produces no console output while it
// works — e.g. Cantina's WebRTC/audio capture tests, SAT-expiration waits.
// TestCafe's spec reporter prints nothing between test start and test end,
// so during the wait the testcafe process is completely silent on stdout.
//
// On sauce-testcafe-runner v3.18+/v3.19 (testcafe 3.7.6), a no-output
// watchdog (sauce-testrunner-utils runWithStdoutWatchdog, default 180s)
// SIGTERMs the testcafe process mid-test. The saucelabs reporter never
// writes sauce-test-report.json, so the job shows "We found no test cases".
// On runner v3.17 (testcafe 3.7.4) the same test passes.

fixture('Watchdog repro: quiet long-running test')
    .page('https://www.saucedemo.com');

test('short chatty test passes first', async (t) => {
    await t.expect(Selector('#user-name').exists).ok();
});

test('stays silent for 4 minutes (exceeds 180s no-output watchdog)', async (t) => {
    await t.wait(240000);
    await t.expect(Selector('#user-name').exists).ok();
});

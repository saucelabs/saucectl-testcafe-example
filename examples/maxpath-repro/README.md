# Windows MAX_PATH zip-extraction repro

Reproduces the **`Sauce Infrastructure Error`** that occurs on **Windows** VMs when
a bundled project contains a file whose path exceeds the legacy Windows
`MAX_PATH = 260` character limit.

This is **not** a TestCafe bug and **not** a saucectl bug — it is in the
**`chef`** component that unpacks the project bundle on the VM. This example just
triggers the customer-facing symptom end-to-end on a real Sauce Windows VM.

## The Bug

When you run `saucectl run`, your `rootDir` is zipped into
`__project__/app.zip` and shipped to the VM. On the VM, `chef` extracts it to
roughly:

```
D:\sauce-testcafe-runner\<version>\bundle\__project__\<your-files>
```

`chef.extract_archive()` uses CPython's `zipfile.extractall()` under **Python 2**,
which does **no** `\\?\` extended-length path prefixing. Any extracted file whose
absolute path exceeds 260 chars fails to write, and the job dies before the test
runs:

```
error extracting zip archive D:\sauce-testcafe-runner\<ver>\bundle\__project__\app.zip
into ...__project__. <type 'exceptions.IOError'>, [Errno 2] No such file or directory
```

Because chef runs on Python 2, the Windows 10 `LongPathsEnabled` registry /
`longPathAware` manifest opt-in does **not** help — 260 is a hard wall.

| Platform | Result |
|----------|--------|
| Windows  | ❌ extraction fails → `Sauce Infrastructure Error` (test never runs) |
| macOS / Linux | ✅ no 260-char limit — same bundle extracts fine, test passes |

## How It Works

- `generate-longpath-fixture.sh` — creates `longpath-fixtures/<deeply-nested-dir>/<long-name>.txt`.
  The path is ~268 chars on its own, so once combined with the VM's
  `__project__` base prefix it is comfortably over 260.
- `tests/smoke.test.js` — a trivial passing test. If it runs at all, extraction
  succeeded. On Windows it never gets the chance.
- `.sauce/config.yml` — targets **`Windows 11`** (required) with an optional,
  commented-out macOS control suite.

macOS/Linux have no 260-char path limit, so the fixture is created locally with
no problem — the failure only surfaces on the Windows VM at extraction time.
That asymmetry is the whole point of the repro.

## Running

```bash
cd examples/maxpath-repro

# 1. Materialize the long-path fixture (already committed, but safe to re-run)
./generate-longpath-fixture.sh

# 2. Run on Sauce (Windows)
saucectl run
```

## Expected vs Actual

- **Expected:** the bundle extracts and `smoke.test.js` passes.
- **Actual (Windows):** the job fails with `Sauce Infrastructure Error` during
  bundle extraction, before the test runs.

To confirm it is Windows-specific, uncomment the macOS control suite in
`.sauce/config.yml` and re-run — the same bundle passes there.

## Root cause / fix

Root cause and the implemented fix live in `chef`:
prefix the extraction root with `\\?\` (absolute, backslash-separated, unicode
under Py2) so member writes become extended-length and bypass MAX_PATH.

Customer-side workarounds until the fix ships:
- Shorten the longest path in your project.
- Generate long-named fixtures **on the VM at runtime** instead of bundling them.

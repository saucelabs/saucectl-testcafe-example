#!/usr/bin/env bash
#
# Generates a fixture file whose path, relative to this example's rootDir, is long
# enough that once saucectl bundles the project and chef extracts it on a Sauce
# *Windows* VM, the file's absolute path exceeds the legacy MAX_PATH = 260 limit.
#
# On the VM the bundle is extracted to roughly:
#   D:\sauce-testcafe-runner\<version>\bundle\__project__\<relative-path>
# That base prefix is ~45 chars, so a relative path of ~230 chars reliably pushes
# the absolute path past 260 and trips the chef `extract_archive` failure.
#
# macOS/Linux have no 260 limit, so this script creates the file with no trouble;
# the failure only manifests on the Windows VM at extraction time. That asymmetry
# is the whole point of the repro.
#
# Run from inside examples/maxpath-repro/ :  ./generate-longpath-fixture.sh
set -euo pipefail

cd "$(dirname "$0")"

ROOT="longpath-fixtures"
# A single deeply-named directory + long filename. Segment names are padded so the
# total relative path comfortably clears 230 characters.
DIR="$ROOT/this-deeply-nested-directory-exists-only-to-push-the-bundled-file-path-well-beyond-the-windows-legacy-max-path-limit-of-260-chars-on-the-sauce-windows-vm"
FILE="$DIR/ExtraLongName_fixture_document_that_reproduces_the_chef_extract_archive_maxpath_failure_Copy.txt"

mkdir -p "$DIR"
printf 'This file exists only so its bundled path exceeds Windows MAX_PATH (260).\n' > "$FILE"

LEN=${#FILE}
echo "Created fixture (relative path length = ${LEN} chars):"
echo "  $FILE"
if [ "$LEN" -lt 215 ]; then
  echo "WARNING: relative path is only ${LEN} chars — may not exceed 260 on the VM." >&2
fi

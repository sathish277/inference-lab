#!/usr/bin/env bash
# Builds a one-page preview for hosts that can't open sub-pages or serve "_" folders.
# Output: ../preview (not used for the real Vercel site).
set -euo pipefail
cd "$(dirname "$0")/.."
SINGLE_PAGE=1 npx next build
rm -rf ../preview && cp -r out ../preview && cd ../preview
rm -rf _not-found lessons 404
mv _next assets-next
grep -rl "/_next/" . | xargs sed -i 's#/_next/#/assets-next/#g'
find . -name "_*" -delete
find . -name "__next*" -delete
find . -type f | sort

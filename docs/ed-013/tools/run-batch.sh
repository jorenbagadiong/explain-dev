#!/usr/bin/env bash
# Runs one batch through its publication gates.
# Usage: bash docs/ed-013/tools/run-batch.sh <batch-id> [detail-topic-id ...]
# Stops before publishing if a pre-publish gate fails. If a post-publish gate fails,
# fix the problem and rerun: already-published topics are skipped.
set -uo pipefail
BATCH="$1"; shift
DETAIL=("$@")
PORT="${PORT:-3111}"
LOG="$(mktemp)"
fail() { echo "GATE FAILED: $1"; tail -40 "$LOG" | cut -c1-240; exit 1; }
quiet_node() { node "$@" 2> >(grep -v -E 'Warning|Reparsing|eliminate this|trace-warnings' >&2); }

quiet_node docs/ed-013/tools/sync-manifest.mjs >/dev/null || fail "manifest sync"
mapfile -t ALL < <(node -e "for (const t of require('./docs/ed-013/curriculum-manifest.json').topics) if (t.batch === process.argv[1]) console.log(t.id)" "$BATCH")
[ "${#ALL[@]}" -gt 0 ] || fail "no topics in batch $BATCH"
mapfile -t PENDING < <(node -e "for (const t of require('./docs/ed-013/curriculum-manifest.json').topics) if (t.batch === process.argv[1] && t.publicationStatus !== 'available') console.log(t.id)" "$BATCH")
echo "$BATCH: ${#ALL[@]} topics, ${#PENDING[@]} to publish"

for id in "${PENDING[@]}"; do [ -f "src/content/react/lessons/$id.ts" ] || fail "missing lesson file: $id"; done
if [ "${#PENDING[@]}" -gt 0 ]; then
  node docs/ed-013/tools/generate-routes.mjs "${PENDING[@]}" || fail "route generation"
  yarn -s lint > "$LOG" 2>&1 || fail "pre-publish lint"
  yarn -s typecheck > "$LOG" 2>&1 || fail "pre-publish typecheck"
  yarn -s test > "$LOG" 2>&1 || fail "pre-publish tests (content, sources, examples)"
  node docs/ed-013/tools/publish-batch.mjs "${PENDING[@]}" || fail "publish"
  quiet_node docs/ed-013/tools/sync-manifest.mjs >/dev/null || fail "manifest sync after publish"
fi

yarn -s lint > "$LOG" 2>&1 || fail "lint"; echo "lint ok"
yarn -s typecheck > "$LOG" 2>&1 || fail "typecheck"; echo "typecheck ok"
yarn -s test > "$LOG" 2>&1 || fail "tests"; grep -E 'Test Files|Tests  ' "$LOG"
TESTS="$(grep -E 'Tests  ' "$LOG" | sed -E 's/ +Tests +//')"
yarn -s build > "$LOG" 2>&1 || fail "build"; echo "build ok"
git checkout -- next-env.d.ts

if curl -s -o /dev/null --max-time 2 "localhost:$PORT/"; then echo "Port $PORT is busy, so browser checks did not run."; exit 1; fi
node_modules/.bin/next start -p "$PORT" > "$LOG" 2>&1 &
SERVER=$!
for _ in $(seq 1 30); do curl -sf -o /dev/null "localhost:$PORT/" && break; sleep 1; done
if [ "${#DETAIL[@]}" -gt 0 ]; then BASE="http://localhost:$PORT" timeout 540 node docs/ed-013/tools/browser-smoke.cjs --detail "${DETAIL[@]}"; else BASE="http://localhost:$PORT" timeout 540 node docs/ed-013/tools/browser-smoke.cjs; fi
SMOKE=$?
kill "$SERVER"; wait "$SERVER" 2>/dev/null
[ "$SMOKE" -eq 0 ] || { echo "GATE FAILED: browser smoke"; exit 1; }
quiet_node docs/ed-013/tools/sync-manifest.mjs --check || exit 1
TODAY="$(date +%F)"
AVAILABLE="$(node -e "console.log(require('./docs/ed-013/curriculum-manifest.json').topics.filter(t => t.publicationStatus === 'available').length)")"
if ! grep -q "^| $BATCH |" docs/ed-013/progress.md; then
  echo "| $BATCH | ${ALL[*]} | Published, $AVAILABLE of 119 available | lint, typecheck, $TESTS, build, browser smoke $TODAY |" >> docs/ed-013/progress.md
fi
echo "$BATCH passed every gate."

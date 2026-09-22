#!/usr/bin/env bash
#
# Fail if a route's real content is missing from the raw (no-JavaScript) HTML.
#
# Why this exists: the app layout used to gate every route behind an auth
# "Loading..." screen, so the server response contained no page content and
# search crawlers indexed nothing. Google renders JavaScript, but in a separate,
# slower, lower-priority queue, and unreliably — content that only exists after
# hydration gets indexed late, partially, or not at all.
#
# Usage:
#   scripts/check-ssr.sh                             # against production
#   BASE_URL=http://localhost:3000 scripts/check-ssr.sh   # against a local build
#
# Check a local PRODUCTION build (`next build && next start`), not `next dev` —
# dev-mode rendering differs and will hide this class of bug.

set -uo pipefail

BASE_URL="${BASE_URL:-https://www.shareskippy.com}"

# route|phrase that must appear in the raw HTML response
CHECKS=(
  "/|ShareSkippy connects dog owners"
  "/our-story|Kaia"
  "/faq|Frequently Asked"
  "/safety|Safety"
  "/community-guidelines|Community Guidelines"
  "/how-to-use|How to Use"
)

# Minimum amount of visible text (tags and scripts stripped) that a route's raw
# HTML must contain. The bug this guards against produced a body whose only text
# was "Loading...", so anything substantial here catches a regression. Small
# inline placeholders (e.g. an image spinner) legitimately contain "Loading...",
# which is why this measures content volume rather than banning the word.
MIN_TEXT_CHARS=800

failures=0

echo "Checking server-rendered HTML at ${BASE_URL}"
echo

for entry in "${CHECKS[@]}"; do
  route="${entry%%|*}"
  phrase="${entry#*|}"
  # Collapse to a single line so a phrase split across source lines still matches.
  body="$(curl -sL --max-time 30 "${BASE_URL}${route}" | tr '\n' ' ')"

  if printf '%s' "$body" | grep -qiF -- "$phrase"; then
    printf '  ok      %-26s contains %s\n' "$route" "\"$phrase\""
  else
    printf '  FAIL    %-26s missing  %s\n' "$route" "\"$phrase\""
    failures=$((failures + 1))
  fi

  # Strip <script>/<style> blocks and tags, then measure the visible text.
  text_chars="$(printf '%s' "$body" \
    | sed -e 's/<script[^>]*>[^<]*<\/script>/ /g' -e 's/<style[^>]*>[^<]*<\/style>/ /g' -e 's/<[^>]*>/ /g' \
    | tr -s '[:space:]' ' ' \
    | wc -c | tr -d ' ')"

  if [ "$text_chars" -ge "$MIN_TEXT_CHARS" ]; then
    printf '  ok      %-26s %s chars of server-rendered text\n' "$route" "$text_chars"
  else
    printf '  FAIL    %-26s only %s chars of text (expected >= %s)\n' "$route" "$text_chars" "$MIN_TEXT_CHARS"
    failures=$((failures + 1))
  fi
done

echo
if [ "$failures" -gt 0 ]; then
  echo "${failures} check(s) failed: page content is missing from the server response."
  exit 1
fi

echo "All routes render their content server-side."

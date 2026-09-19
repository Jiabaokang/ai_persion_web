#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/opt/jbksy}
SERVICE=${SERVICE:-jbksy}
HEALTH_URL=${HEALTH_URL:-http://127.0.0.1:3000/api/health}
artifact=""
sha=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --artifact) artifact=$2; shift 2 ;;
    --sha) sha=$2; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -d "$APP_DIR" ] || { echo "Missing app directory: $APP_DIR" >&2; exit 1; }
[ -f "$artifact" ] || { echo "Missing artifact: $artifact" >&2; exit 1; }
[ -n "$sha" ] || { echo "Missing deployment SHA" >&2; exit 1; }

candidate=$(mktemp -d "$APP_DIR/.output.next.XXXXXX")
cleanup_candidate() {
  case "$candidate" in
    "$APP_DIR"/.output.next.*) [ ! -d "$candidate" ] || rm -rf -- "$candidate" ;;
  esac
}
trap cleanup_candidate EXIT

tar -xzf "$artifact" -C "$candidate"
[ -f "$candidate/server/index.mjs" ] || { echo "Artifact has no server/index.mjs" >&2; exit 1; }
node --check "$candidate/server/index.mjs"
printf '%s\n' "$sha" > "$candidate/DEPLOYED_SHA"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
previous="$APP_DIR/.output.previous.$stamp"
failed="$APP_DIR/.output.failed.$stamp"

[ ! -d "$APP_DIR/.output" ] || mv "$APP_DIR/.output" "$previous"
mv "$candidate" "$APP_DIR/.output"
candidate=""

if systemctl restart "$SERVICE" && sleep 3 && curl -fsS --max-time 10 "$HEALTH_URL" >/dev/null; then
  echo "Deployed $sha"
  exit 0
fi

systemctl stop "$SERVICE" || true
mv "$APP_DIR/.output" "$failed"
if [ -d "$previous" ]; then
  mv "$previous" "$APP_DIR/.output"
  systemctl restart "$SERVICE"
fi
echo "Health check failed; previous output restored" >&2
exit 1

#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$REPO_ROOT/frontend"
ANDROID="$FRONTEND/android"
OUTPUT_DIR="$REPO_ROOT"

echo "==> Installing JS dependencies..."
cd "$FRONTEND"
npm install

echo "==> Building debug APK..."
export NODE_PATH="$FRONTEND/node_modules"
cd "$ANDROID"
./gradlew assembleDebug

APK_SRC="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"

if [[ ! -f "$APK_SRC" ]]; then
  echo "ERROR: APK not found at $APK_SRC" >&2
  exit 1
fi

cp "$APK_SRC" "$OUTPUT_DIR/YeaAmigo-debug.apk"
echo "==> APK ready: $OUTPUT_DIR/YeaAmigo-debug.apk"

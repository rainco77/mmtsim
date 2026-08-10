#!/bin/bash
# Renders the three design pages to PNG at the design size, 1280x800.
# The headless shell is used because "chrome --headless" reserves window
# decoration and would deliver a viewport shorter than the window.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
SHELL_BIN="$HOME/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell"
for f in uebersicht band-detail zieh-moment; do
  "$SHELL_BIN" --no-sandbox --hide-scrollbars --window-size=1280,800 \
    --screenshot="$DIR/$f.png" --virtual-time-budget=2000 "file://$DIR/$f.html"
done

#!/bin/bash -ex
V=$(cat chrome/manifest.json | grep '"version"' | grep -oP "\d+\.\d+\.\d+")
rm -f "duplicate-tab-$V.zip"
cd chrome
zip -r "../duplicate-tab-$V.zip" . -x '*.DS_Store' -x '*Thumbs.db'

#!/bin/bash -ex
V=$(cat firefox/manifest.json | grep '"version"' | grep -oP "\d+\.\d+\.\d+")
rm -f "duplicate-tab-$V.xpi"
cd firefox
zip -r "../duplicate-tab-$V.xpi" . -x '*.DS_Store' -x '*Thumbs.db'

#!/usr/bin/env sh
set +e

# Install dependencies
if [ -e package.json ]; then
  npm install
fi

exec $@

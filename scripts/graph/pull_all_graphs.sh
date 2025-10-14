#!/usr/bin/env bash
set -euo pipefail

S3_ACCESS_KEY=$(cat /run/secrets/S3_ACCESS_KEY)
S3_SECRET_KEY=$(cat /run/secrets/S3_SECRET_KEY)

mkdir -p /app/pull

echo "Pulling release graphs"
/app/nabu pull /app/pull_temp/ \
  --prefix "graphs/latest/" \
  --s3-access-key "$S3_ACCESS_KEY" \
  --s3-secret-key "$S3_SECRET_KEY" \
  --bucket harvest-geoconnex-us \
  --port 443 \
  --address storage.googleapis.com \
  --ssl \
  --name-filter "wwdh" \
  --log-level DEBUG 

# ensure that there are graphs in /tmp/pull
if [ -z "$(ls -A /app/pull_temp)" ]; then
  echo "No graphs pulled"
  exit 1
fi 

echo "Graphs pulled to /app/pull_temp"
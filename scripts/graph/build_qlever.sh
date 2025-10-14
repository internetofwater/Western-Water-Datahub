#!/bin/bash

# This script builds the Qlever graph
# it uses buildkit to allow for secrets
# at build time without exposing them
# in the final image

set -a; source .env; set +a
echo "Building Qlever with $S3_ACCESS_KEY $S3_SECRET_KEY" 

export DOCKER_BUILDKIT=1

docker build \
  --build-arg CACHEBUST=$(date +%s)  \
  --secret id=S3_ACCESS_KEY,env=S3_ACCESS_KEY \
  --secret id=S3_SECRET_KEY,env=S3_SECRET_KEY \
  -t wwdh-qlever .
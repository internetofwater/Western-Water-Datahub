#!/bin/bash
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


# This script builds the Qlever graph
# it uses buildkit to allow for secrets
# at build time without exposing them
# in the final image

set -a; source .env; set +a

export DOCKER_BUILDKIT=1

# we bust the cache so that we can use nabu's built in caching
# otherwise we might not fetch the latest graphs
docker build \
  --build-arg CACHEBUST=$(date +%s)  \
  --secret id=S3_ACCESS_KEY,env=S3_ACCESS_KEY \
  --secret id=S3_SECRET_KEY,env=S3_SECRET_KEY \
  -t wwdh-qlever .

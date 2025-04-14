# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Copy from the cache into container and the use system Python interpreter 
ENV UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

WORKDIR /opt/pygeoapi

# System dependencies for GDAL and others
RUN apt-get update && apt-get install -y --no-install-recommends libgdal-dev git build-essential \
    && apt-get clean && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy project metadata for dependency resolution
COPY pyproject.toml uv.lock /opt/pygeoapi/
RUN uv sync --group deployment

COPY packages /opt/pygeoapi/packages/
# --inexact makes it so the deployment packages we just copied aren't removed
RUN uv sync --all-packages --inexact 

COPY pygeoapi-deployment/ /opt/pygeoapi/pygeoapi-deployment/

# Set up environment
ENV PATH="/opt/pygeoapi/.venv/bin:$PATH"

# Entrypoint for running the app
ENTRYPOINT [ "/opt/pygeoapi/pygeoapi-deployment/entrypoint.sh" ]

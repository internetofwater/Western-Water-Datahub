# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Copy from the cache into container and the use system Python interpreter
# Set no cache to true so we don't use the uv cache but instead use the docker layer cache
# this is since we are not using buildkit and thus cannot cache to a mount dir on the host
ENV UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0 UV_NO_CACHE=true

ARG DEB_PACKAGES="\
    gdal-bin \
    libgdal-dev \
    git \
    build-essential"

WORKDIR /opt/pygeoapi

# System dependencies for GDAL and others
RUN apt-get update \
    && apt-get install -y --no-install-recommends ${DEB_PACKAGES} \
    && apt-get clean && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy project metadata for dependency resolution
COPY pyproject.toml uv.lock /opt/pygeoapi/
# Sync to install dependencies; includes --group to also include the extra deployment group
# We install this before the integration packages so it can be cached and reused
RUN uv sync --group deployment

COPY packages /opt/pygeoapi/packages/
# Install all local integrations
# --inexact makes it so the deployment packages we just copied aren't removed
RUN uv sync --all-packages --inexact 

COPY pygeoapi-deployment/ /opt/pygeoapi/pygeoapi-deployment/
COPY pygeoapi.config.yml /opt/pygeoapi/local.config.yml

# Set up environment
ENV PATH="/opt/pygeoapi/.venv/bin:$PATH"

# WWDH uses a custom event loop; we define the
# import path here
ENV PYGEOAPI_CUSTOM_EVENT_LOOP_MODULE=com.env
ENV PYGEOAPI_CUSTOM_EVENT_LOOP_GETTER=get_loop

# Entrypoint for running the app
ENTRYPOINT [ "/opt/pygeoapi/pygeoapi-deployment/entrypoint.sh" ]

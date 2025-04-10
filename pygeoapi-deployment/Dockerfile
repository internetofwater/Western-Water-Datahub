FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Copy from the cache into container and the use system Python interpreter 
ENV UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=0

WORKDIR /opt/pygeoapi

# Copy project metadata for dependency resolution
COPY pyproject.toml uv.lock /opt/pygeoapi/
COPY packages /opt/pygeoapi/packages/

# System dependencies for GDAL and others
RUN apt-get update && apt-get install -y libgdal-dev git build-essential \
    && apt-get clean && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies
# Use buildkit with docker to persist uv installation cache for faster builds 
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --all-groups --all-packages

COPY pygeoapi-deployment/ /opt/pygeoapi/pygeoapi-deployment/

# Set up environment
ENV PATH="/opt/pygeoapi/.venv/bin:$PATH"

# Entrypoint for running the app
ENTRYPOINT [ "/opt/pygeoapi/pygeoapi-deployment/entrypoint.sh" ]

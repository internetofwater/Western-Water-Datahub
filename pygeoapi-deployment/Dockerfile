FROM python:3.12

WORKDIR /opt/pygeoapi

RUN apt-get update && apt-get install -y libgdal-dev \
    && apt-get clean && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Pre-copy only dependency-related files for cache efficiency
COPY pyproject.toml /opt/pygeoapi/pyproject.toml
COPY packages /opt/pygeoapi/packages

# Install top-level package with shared dependencies
RUN pip install /opt/pygeoapi

# Install each individual mapping package separately
RUN bash -c "pip install /opt/pygeoapi/packages/*"

# Copy deployment stuff separately so this doesn't bust the pip cache unless needed
COPY pygeoapi-deployment /opt/pygeoapi/pygeoapi-deployment

# Install deployment-specific dependencies
RUN pip install -r /opt/pygeoapi/pygeoapi-deployment/deployment-requirements.txt

ENTRYPOINT [ "/opt/pygeoapi/pygeoapi-deployment/entrypoint.sh" ]

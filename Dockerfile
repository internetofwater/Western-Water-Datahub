FROM geopython/pygeoapi:latest

WORKDIR /pygeoapi

# Install the additional requirements
RUN pip install --no-cache-dir redis
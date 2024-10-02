FROM geopython/pygeoapi:latest

WORKDIR /pygeoapi

# Install the additional requirements for the RISE mapping
RUN pip install --no-cache-dir redis
RUN pygeoapi openapi generate /pygeoapi/local.config.yml --output-file /pygeoapi/local.openapi.yml

### Below is used for hot reloading; remove the below lines for standard production pygeoapi
ENTRYPOINT [ "pygeoapi", "serve" ]
###

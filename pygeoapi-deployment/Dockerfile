FROM python:3.12

WORKDIR /opt/pygeoapi

ARG ADD_DEB_PACKAGES="\
    gunicorn \
    python3-dask \
    python3-fiona \
    python3-gdal \
    python3-jsonpatch \
    python3-netcdf4 \
    python3-pandas \
    python3-pyproj \
    python3-rasterio \
    python3-scipy \
    python3-shapely \
    python3-xarray \
    python3-zarr \
    python3-starlette \
    python3-pyld"

# Install GDAL and dependencies
RUN apt-get update && apt-get install -y \
    libgdal-dev \
    build-essential \
    ${ADD_DEB_PACKAGES} \
    && apt-get clean \
    && apt autoremove -y  \
    && rm -rf /var/lib/apt/lists/*



# Install the top level mapping package with any shared dependencies
COPY packages /opt/pygeoapi/packages
COPY pyproject.toml /opt/pygeoapi/pyproject.toml
RUN pip install /opt/pygeoapi
# Install each individual mapping package with their individual dependencies separately
RUN bash -c "pip install /opt/pygeoapi/packages/*"

# Move over and install all production dependencies / configurations
COPY pygeoapi-deployment /opt/pygeoapi/pygeoapi-deployment
RUN pip install -r /opt/pygeoapi/pygeoapi-deployment/deployment-requirements.txt

ENTRYPOINT [ "/opt/pygeoapi/pygeoapi-deployment/entrypoint.sh" ]

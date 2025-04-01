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

COPY requirements.txt /opt/pygeoapi/requirements.txt

RUN pip install --no-cache-dir -r /opt/pygeoapi/requirements.txt

COPY . /opt/pygeoapi

ENTRYPOINT [ "/opt/pygeoapi/entrypoint.sh" ]

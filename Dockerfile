# Use the geopython/pygeoapi image as the base
FROM geopython/pygeoapi:latest

WORKDIR /pygeoapi

# Copy the extra-requirements.txt file into the container
COPY extra-requirements.txt /pygeoapi/extra-requirements.txt

# Install the additional requirements
RUN pip install --no-cache-dir -r extra-requirements.txt
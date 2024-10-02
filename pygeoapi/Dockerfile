FROM geopython/pygeoapi:latest

RUN pip3 install https://github.com/cgs-earth/pygeoapi-plugins/archive/refs/heads/master.zip
RUN pip3 install https://github.com/cgs-earth/RISE-EDR-Mappings/archive/refs/heads/main.zip

COPY pygeoapi.config.yml /pygeoapi/local.config.yml

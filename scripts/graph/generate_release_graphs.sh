#!/usr/bin/env bash

# This script generates release graphs
# and ensures that all the relevant sources for
# wwdh are using the latest released data


set -e  # exit on error

# Load environment variables from .env file
# Use 'set -a' so all variables are automatically exported
set -a
source .env
set +a
# Now the variables from .env are available

docker pull internetofwater/nabu:latest

for PREFIX in \
  "summoned/wwdh_awdb_forecasts_awdb_forecasts__0/" \
  "summoned/wwdh_noaa_rfc_noaa_rfc__0/" \
  "summoned/wwdh_snotel_snotel__0/" \
  "summoned/wwdh_usace_usace_access_to_water__0" \
  "summoned/wwdh_usbr_rise_rise__0"
do
  docker run internetofwater/nabu:latest release \
    --port 443 \
    --region us \
    --ssl \
    --bucket harvest-geoconnex-us \
    --address storage.googleapis.com \
    --prefix "$PREFIX" \
    --s3-access-key "$S3_ACCESS_KEY" \
    --s3-secret-key "$S3_SECRET_KEY" \
    --log-level DEBUG 
done

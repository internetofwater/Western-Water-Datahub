# Entrypoint 

We need this file here since we need hot reloading for development. However, pygeoapi does not allow the user to configure that via an env var. So we need to mount this file into the container with the added hot reload feature.
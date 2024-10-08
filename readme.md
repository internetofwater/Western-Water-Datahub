# RISE EDR Mappings

This repository maps the USBR RISE API to OGC EDR using pygeoapi for ETL. It defaults to redis for the caching implementation.

To run

```
docker compose -f docker-compose-rise.yml up
```

You can run tests by entering the container shell and running pytest or opening the provided devcontainer and running the vscode test runner.

## Limitations

- This repository uses extensive caching to prevent unnecessary fetch requests to RISE. OGC EDR does not map cleanly onto RISE without this.
  - We set a default TTL of 24 hours. However, whenever we need to repopulate the cache, RISE sometimes denies parallelized requests and throws an error saying the server is down for maintenance, which is not the case.

## Development Setup

- This repository uses a devcontainer to allow for dynamic development inside of pygeoapi while isolating our code
- the `.gitignore` ignores all files but ours so that we can work inside a standardized environment while ignoring pygeoapi upstream code
- when you are inside the container, run `pygeoapi serve` to run the server with hotreloading
- many files are prefixed with the word `rise` since when we mount them in the container we don't want to override existing pygeoapi files

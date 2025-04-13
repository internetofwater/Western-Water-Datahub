#!/bin/bash
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


# pygeoapi entry script

echo "START /entrypoint.sh"

set +e

export PYGEOAPI_HOME=/opt/pygeoapi/pygeoapi-deployment
export PYGEOAPI_CONFIG="${PYGEOAPI_HOME}/pygeoapi.config.yml"
export PYGEOAPI_OPENAPI="${PYGEOAPI_HOME}/pygeoapi.openapi.yml"

# gunicorn env settings with defaults
SCRIPT_NAME=${SCRIPT_NAME:=/}
CONTAINER_NAME=${CONTAINER_NAME:=pygeoapi}
CONTAINER_HOST=${CONTAINER_HOST:=0.0.0.0}
CONTAINER_PORT=${CONTAINER_PORT:=80}
WSGI_APP=${WSGI_APP:=pygeoapi.starlette_app:APP}
WSGI_WORKERS=${WSGI_WORKERS:=4}
WSGI_WORKER_TIMEOUT=${WSGI_WORKER_TIMEOUT:=6000}
WSGI_WORKER_CLASS=${WSGI_WORKER_CLASS:=uvicorn.workers.UvicornH11Worker}

# What to invoke: default is to run gunicorn server
entry_cmd=${1:-run}

# Shorthand
function error() {
	echo "ERROR: $@"
	exit -1
}

# Workdir
cd ${PYGEOAPI_HOME}

echo "Trying to generate openapi.yml"
pygeoapi openapi generate ${PYGEOAPI_CONFIG} --output-file ${PYGEOAPI_OPENAPI}

[[ $? -ne 0 ]] && error "openapi.yml could not be generated ERROR"

echo "openapi.yml generated continue to pygeoapi"


# SCRIPT_NAME should not have value '/'
[[ "${SCRIPT_NAME}" = '/' ]] && export SCRIPT_NAME="" && echo "make SCRIPT_NAME empty from /"

echo "Starting gunicorn name=${CONTAINER_NAME} on ${CONTAINER_HOST}:${CONTAINER_PORT} with ${WSGI_WORKERS} workers and SCRIPT_NAME=${SCRIPT_NAME}"
exec gunicorn --workers ${WSGI_WORKERS} \
    --worker-class=${WSGI_WORKER_CLASS} \
    --timeout ${WSGI_WORKER_TIMEOUT} \
    --name=${CONTAINER_NAME} \
    --bind ${CONTAINER_HOST}:${CONTAINER_PORT} \
    ${WSGI_APP}

echo "END /entrypoint.sh"

#!/bin/bash
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


# pygeoapi entry script

echo "START /entrypoint.sh"

set +e

export PYGEOAPI_HOME=/opt/pygeoapi

if [[ -z "$PYGEOAPI_CONFIG" ]]; then
    export PYGEOAPI_CONFIG="${PYGEOAPI_HOME}/local.config.yml"
fi
if [[ -z "$PYGEOAPI_OPENAPI" ]]; then
    export PYGEOAPI_OPENAPI="${PYGEOAPI_HOME}/local.openapi.yml"
fi

# gunicorn env settings with defaults
SCRIPT_NAME=${SCRIPT_NAME:=/}
CONTAINER_NAME=${CONTAINER_NAME:=pygeoapi}
CONTAINER_HOST=${CONTAINER_HOST:=0.0.0.0}
CONTAINER_PORT=${CONTAINER_PORT:=80}
WSGI_APP=${WSGI_APP:=pygeoapi.flask_app:APP}
WSGI_WORKERS=${WSGI_WORKERS:=4}
WSGI_WORKER_TIMEOUT=${WSGI_WORKER_TIMEOUT:=6000}
WSGI_WORKER_CLASS=${WSGI_WORKER_CLASS:=gevent}

# What to invoke: default is to run gunicorn server
entry_cmd=${1:-run}

# Shorthand
function error() {
	echo "ERROR: $@"
	exit -1
}

generate_openapi() {
    # Workdir
    cd ${PYGEOAPI_HOME}
    # Generate openapi.yml if it does not exist
    if [[ ! -f "${PYGEOAPI_OPENAPI}" ]]; then
        echo "openapi.yml not found, generating..."
        pygeoapi openapi generate ${PYGEOAPI_CONFIG} --output-file ${PYGEOAPI_OPENAPI}
        [[ $? -ne 0 ]] && error "openapi.yml could not be generated ERROR"
    else
        echo "openapi.yml already exists, skipping generation"
    fi
}

start_gunicorn() {
    # Workdir
    cd ${PYGEOAPI_HOME}
    # SCRIPT_NAME should not have value '/'
    [[ "${SCRIPT_NAME}" = '/' ]] && export SCRIPT_NAME="" && echo "make SCRIPT_NAME empty from /"

    echo "Starting gunicorn name=${CONTAINER_NAME} on ${CONTAINER_HOST}:${CONTAINER_PORT} with ${WSGI_WORKERS} workers and SCRIPT_NAME=${SCRIPT_NAME}"
    exec gunicorn --workers ${WSGI_WORKERS} \
        --worker-class=${WSGI_WORKER_CLASS} \
        --timeout ${WSGI_WORKER_TIMEOUT} \
        --name=${CONTAINER_NAME} \
        --bind ${CONTAINER_HOST}:${CONTAINER_PORT} \
        ${@} \
        ${WSGI_APP}
}

case ${entry_cmd} in
    # Run pygeoapi server
    run)
        # Start
        generate_openapi
        start_gunicorn
        ;;

    # Run pygeoapi server with hot reload
    run-with-hot-reload)
        # Lock all Python files (for gunicorn hot reload), if running with user root
        if [[ $(id -u) -eq 0 ]]
        then
            echo "Running pygeoapi as root"
            find . -type f -name "*.py" | xargs chmod 0444
        fi

        # Start with hot reload options
        generate_openapi
        start_gunicorn --reload --reload-extra-file ${PYGEOAPI_CONFIG}
        ;;

    crawl-resviz)
        echo "Crawling resviz layers into PostGIS"
        exec resviz
        ;;

    *)
        error "unknown command arg: must be run (default), run-with-hot-reload, or test"
        ;;
esac


echo "END /entrypoint.sh"

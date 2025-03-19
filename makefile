# install dependencies
# this project uses uv to manage dependencies
deps:
	uv sync --all-groups --locked --all-packages

# serve the api (requires redis to be running)
dev: 
	OTEL_SDK_DISABLED=false uv run pygeoapi openapi generate local.config.yml --output-file local.openapi.yml
	OTEL_SDK_DISABLED=false PYGEOAPI_CONFIG=local.config.yml PYGEOAPI_OPENAPI=local.openapi.yml uv run pygeoapi serve --starlette

devNoOTEL:
	OTEL_SDK_DISABLED=true uv run pygeoapi openapi generate local.config.yml --output-file local.openapi.yml
	OTEL_SDK_DISABLED=true PYGEOAPI_CONFIG=local.config.yml PYGEOAPI_OPENAPI=local.openapi.yml uv run pygeoapi serve --starlette

test:
	uv run pytest -n auto -x --maxfail=1 -vv --durations=5

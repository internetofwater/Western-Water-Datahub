# Variables
PYGEOAPI_CONFIG = pygeoapi-deployment/pygeoapi.config.yml
PYGEOAPI_OPENAPI = local.openapi.yml

# install dependencies
# this project uses uv to manage dependencies
deps:
	uv sync --all-groups --locked --all-packages

# serve the api (requires redis to be running)
dev: 
	OTEL_SDK_DISABLED=false uv run pygeoapi openapi generate $(PYGEOAPI_CONFIG) --output-file $(PYGEOAPI_OPENAPI)
# 	we must be in the pygeoapi-deployment directory for the templates to have the right relative path
	cd pygeoapi-deployment && OTEL_SDK_DISABLED=false PYGEOAPI_CONFIG=../$(PYGEOAPI_CONFIG) PYGEOAPI_OPENAPI=../$(PYGEOAPI_OPENAPI) uv run pygeoapi serve --starlette

devNoOTEL:
	OTEL_SDK_DISABLED=true uv run pygeoapi openapi generate $(PYGEOAPI_CONFIG) --output-file $(PYGEOAPI_OPENAPI)
# 	we must be in the pygeoapi-deployment directory for the templates to have the right relative path
	cd pygeoapi-deployment && OTEL_SDK_DISABLED=true PYGEOAPI_CONFIG=../$(PYGEOAPI_CONFIG) PYGEOAPI_OPENAPI=../$(PYGEOAPI_OPENAPI) uv run pygeoapi serve --starlette

test:
	# run tests in parallel with pytest-xdist and stop after first failure; run in verbose mode and show durations of the 5 slowest tests
	uv run pyright && uv run pytest -n 20 -x --maxfail=1 -vv --durations=5 -m "not upstream"

cov:
	uv run pytest -n 20 -x --maxfail=1 -vv --durations=5 --cov

cyclo:
	uv run radon cc --order SCORE --show-complexity --min B .

clean:
	rm -rf .venv/
	rm -rf .pytest_cache/

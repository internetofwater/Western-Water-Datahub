# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import os
from typing import Optional
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (
    BatchSpanProcessor,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
import requests
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
import asyncio
import threading

"""
This file contains initialization code and global vars that are
used throughout the entire integration
"""

print(
    f"Starting server with env var OTEL_SDK_DISABLED set to '{os.environ.get('OTEL_SDK_DISABLED')}'"
)

_otel_initialized = False


def init_otel():
    """Initialize the open telemetry config"""
    global _otel_initialized
    assert not _otel_initialized, "Open telemetry has already been initialized"
    _otel_initialized = True

    resource = Resource(
        attributes={"service.name": os.getenv("OTEL_SERVICE_NAME", "wwdh")}
    )
    provider = TracerProvider(resource=resource)
    COLLECTOR_ENDPOINT = os.environ.get("COLLECTOR_ENDPOINT", "127.0.0.1")
    COLLECTOR_GRPC_PORT = os.environ.get("COLLECTOR_GRPC_PORT", 4317)

    processor = BatchSpanProcessor(
        OTLPSpanExporter(endpoint=f"http://{COLLECTOR_ENDPOINT}:{COLLECTOR_GRPC_PORT}")
    )
    provider.add_span_processor(processor)

    # Sets the global default tracer provider
    trace.set_tracer_provider(provider)

    if (
        os.environ.get("OTEL_PYTHON_AIOHTTP_CLIENT_INSTRUMENTATION", "true").lower()
        == "true"
    ):
        AioHttpClientInstrumentor().instrument()
    print("Initialized open telemetry")


init_otel()
requests.packages.urllib3.util.connection.HAS_IPV6 = False  # type: ignore

TRACER = trace.get_tracer(os.environ.get("OTEL_TRACER_NAME", "wwdh_tracer"))

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))


_custom_event_loop: Optional[asyncio.AbstractEventLoop] = None
_custom_event_loop_thread: Optional[threading.Thread] = None


def get_loop():
    """
    Get the custom event loop for async operations; this can
    be used for passing the loop to other tools which internally
    use asyncio and need a reference to the event loop
    """

    def _start_loop(loop: asyncio.AbstractEventLoop):
        asyncio.set_event_loop(loop)
        loop.run_forever()

    global _custom_event_loop, _custom_event_loop_thread

    if _custom_event_loop is None:
        _custom_event_loop = asyncio.new_event_loop()
        _custom_event_loop_thread = threading.Thread(
            target=_start_loop,
            args=(_custom_event_loop,),
            daemon=True,
        )
        _custom_event_loop_thread.start()

    return _custom_event_loop


# Initialize the event loop
# This MUST BE DONE BEFORE ANY ASYNC OPERATIONS
# i.e. this means that you should not have any global
# code which utilizes async operations
_custom_event_loop = get_loop()

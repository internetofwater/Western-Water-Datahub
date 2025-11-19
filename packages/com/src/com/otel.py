# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import functools
import inspect
import os
from opentelemetry import trace

from com.env import TRACER as GLOBAL_TRACER


def otel_trace():
    """Decorator to automatically set the span name using the file and function name."""

    def decorator(func):
        filename = os.path.splitext(os.path.basename(inspect.getfile(func)))[0]
        span_name = f"{filename}.{func.__name__}"

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with GLOBAL_TRACER.start_as_current_span(span_name):
                return func(*args, **kwargs)

        return wrapper

    return decorator

def add_args_as_attributes_to_span():
    """
    Inspect the caller's frame and add all arguments (except `self`)
    as attributes on the current OpenTelemetry span; useful for
    debugging to see what arguments were passed to a function.
    """
    span = trace.get_current_span()

    # No active span? Nothing to do.
    if span is None or not span.is_recording():
        return

    try:
        # Grab the caller's frame
        current_frame = inspect.currentframe()
        if not current_frame:
            return

        callee_frame = current_frame.f_back
        if not callee_frame:
            return

        # Get local variables of the calling function
        args = callee_frame.f_locals

        func_name = callee_frame.f_code.co_name

        for name, value in args.items():
            if name == "self":
                continue
            span.set_attribute(f"{func_name}.arg.{name}", str(value))
    except Exception:
        # Never make the app crash because of tracing
        pass

from com.env import init_otel
import pytest


def test_double_init():
    """Test that calling init_otel twice raises an assertion error"""
    with pytest.raises(AssertionError):
        init_otel()

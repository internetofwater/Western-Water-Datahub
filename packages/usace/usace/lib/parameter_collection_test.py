from usace.lib.parameter_collection import ParameterCollection


def test_parameter_collection():
    pc = ParameterCollection()
    assert pc.parameters

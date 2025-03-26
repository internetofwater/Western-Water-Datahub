# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

from snotel.snotel_edr import SnotelEDRProvider

conf = {
    "name": "snotel",
    "title": "Snotel",
    "description": "Snotel",
    "type": "edr",
    "data": "https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html",
}


def test_cube():
    # Example: http://localhost:5000/collections/snotel-edr/cube?bbox=-164.300537,67.195518,-160.620117,68.26125
    p = SnotelEDRProvider(conf)
    bboxCovering1175InAlaska = [-164.300537, 67.195518, -160.620117, 68.26125]
    out = p.cube(bbox=bboxCovering1175InAlaska)
    assert out
    assert len(out["coverages"]) == 13


def test_cube_with_multiple_locations():
    # Example: http://localhost:5000/collections/snotel-edr/cube?bbox=-136.499634,58.969836,-134.588013,59.822732
    bboxCoveringAlaska1285andAlaska1176 = [
        -136.499634,
        58.969836,
        -134.588013,
        59.822732,
    ]
    p = SnotelEDRProvider(conf)
    out = p.cube(bbox=bboxCoveringAlaska1285andAlaska1176)
    coveragesIn1176 = 8
    coveragesIn1285 = 7

    assert len(out["coverages"]) == coveragesIn1176 + coveragesIn1285

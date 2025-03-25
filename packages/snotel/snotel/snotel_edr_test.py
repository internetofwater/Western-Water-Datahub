from snotel.snotel_edr import SnotelEDRProvider

conf = {
    "name": "snotel",
    "title": "Snotel",
    "description": "Snotel",
    "type": "edr",
    "data": "https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html",
}


def test_cube():
    p = SnotelEDRProvider(conf)
    bboxCovering1175InAlaska = [-164.300537, 67.195518, -160.620117, 68.26125]
    out = p.cube(bbox=bboxCovering1175InAlaska)
    assert out
    assert len(out["coverages"]) == 13

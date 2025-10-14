The US is divided into NHD catchments

sciencebase has the catchments polygons. if you put a point in one of those polygons then you know which catchment it is in. each catchment is associated with 0 to 1 mainstems. 

https://labs-beta.waterdata.usgs.gov/api/fabric/pygeoapi/collections/catchmentsp/items

you can essentially use that link above to check the geometry and then map the catchment to the associated mainstem

the other way to do it is to index the whole dataset in the nldi 

once it is in the nldi it has a mainstem association https://api.water.usgs.gov/nldi/linked-data/ca_gages/IBS?f=json 
This directory contains all code for generating a static json which maps ids from the national inventory of dams to the [GRanD database](https://www.globaldamwatch.org/grand).

To use this you need to have both a geopackage for the dams in the GRanD database and a geopackage for the dams in the NID.

To get these geopackages run the commands in the [makefile](./makefile).

Finally once you have the geopackages you can run the [geo_join.py](./geo_join.py) script to generate the json which maps the ids of the NID dams to the GRanD dams.

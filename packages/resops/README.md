An intengration with the ResOpsUS dataset. It provides a collection of dams labeled according to the NID ID along with 30 year averages. This directory contains a static json which maps ids from the national inventory of dams to the [GRanD database](https://www.globaldamwatch.org/grand).

To generate the necessary static files to use this integration, you need to have both a geopackage for the dams in the GRanD database and a geopackage for the dams in the NID.

To get these geopackages for generating the static json assets, run the commands in the [makefile](./makefile).
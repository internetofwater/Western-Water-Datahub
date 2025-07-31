An intengration with the National Inventory of Dams (NID)

It provides a collection of dams with 30 year averages, and a static json which maps ids from the national inventory of dams to the [GRanD database](https://www.globaldamwatch.org/grand).

To use this you need to have both a geopackage for the dams in the GRanD database and a geopackage for the dams in the NID.

To get these geopackages for generating the static json asset, run the commands in the [makefile](./makefile).
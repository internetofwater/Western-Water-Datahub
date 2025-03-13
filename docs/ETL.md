For the optimal path of a location query it seems like you can

- fetch `location/X`
- fetch all the associated catalogrecords
- from each catalogrecord, fetch the associated catalogitem
- for catalogitem use the catalogitem number as a query param for the `itemId` field in the `result/` endpoint
  - my understanding is that we can also use `locationId` here. However, if we don't have the catalogitem and thus don't filter by `itemId` it seems like we would potentially overfetch a ton if we only want the results of a single catalogitem.
- join the `result/` value with the location metadata/geometry
- return coveragejson according to the EDR spec

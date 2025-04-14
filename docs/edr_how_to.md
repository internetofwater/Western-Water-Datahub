# How to write an EDR proxy mapping

For EDR you need a way to both
- fetch all locations with their associated parameters
- filter the locations by things like parameters, dates, bbox, etc.
- join the locations' parameters to their results

This essentially means that for an EDR proxy you need to want an easy way to fetch lots of data all at once and then filter it on the client side. You will have better caching with infrequent big fetches to the source rather than less frequent smaller ones. This is since some source APIs have a rate limit or require blocking joins, thus being impractical for real-time use without caching.

Once locations are obtained, you need a way of joining the location's parameters to the associated results. It is easier to do this is the source API is not paginated and has no rate limits. Otherwise fetching lots of timeseries data will cause issues. A performant EDR proxy will have relatively few client-side joins, if any, between a location, its parameters, and its results.
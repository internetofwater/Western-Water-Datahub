
![layers to query in esri map server](image.png)

You must query each layer separately and you cannot query 0, 6 or 12 since those appear to be a special top level layer or something analogous

Works:
```sh
curl 'https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/1/query?where=1=1&outFields=*&f=json'
```

Does not work:

```
 curl 'https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/12/query?where=1=1&outFields=*&f=json'

{"error":{"code":400,"message":"Invalid or missing input parameters.","details":[]}}⏎                                         

 curl 'https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/6/query?where=1=1&outFields=*&f=json'

{"error":{"code":400,"message":"Invalid or missing input parameters.","details":[]}}⏎                                         

 curl 'https://mapservices.weather.noaa.gov/vector/rest/services/precip/wpc_qpf/MapServer/0/query?where=1=1&outFields=*&f=json'

{"error":{"code":400,"message":"Invalid or missing input parameters.","details":[]}}⏎                                          
```
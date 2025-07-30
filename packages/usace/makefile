nid:
	wget https://nid.sec.usace.army.mil/api/nation/gpkg

grand:
# NOTE this may have issues with pagination if you are using a different version of gdal or built against a different version of libcurl
	ogr2ogr -f GPKG dams.gpkg "https://wwf-sight-maps.org/arcgis/rest/services/Global/Dams/MapServer/3/query?where=1=1&outfields=*&returnGeometry=true&resultRecordCount=100&f=pjson" -nln dams -oo FEATURE_SERVER_PAGING=YES
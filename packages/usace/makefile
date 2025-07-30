resops:
	wget "https://zenodo.org/records/5893641/files/ResOpsUS.zip?download=1" -O ResOpsUS.zip
	unzip ResOpsUS.zip

nid:
	wget https://nid.sec.usace.army.mil/api/nation/gpkg

grand:
# NOTE this may have issues with pagination if you are using a different version of gdal or built against a different version of libcurl
	ogr2ogr -f GPKG dams.gpkg "https://wwf-sight-maps.org/arcgis/rest/services/Global/Dams/MapServer/3/query?where=1=1&outfields=*&returnGeometry=true&resultRecordCount=100&f=pjson" -nln dams -oo FEATURE_SERVER_PAGING=YES

generate_30_year_averages:
# make sure you are in the proper venv before running
	python generate_30_year_averages.py
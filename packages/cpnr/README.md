This folder holds all the code for crawling the Columbia Pacific Northwest-Region CSV data from RISE.

Unlike other packages in this directory structure, this implementation is not used at runtime in pygeoapi.
Instead it serves to create a command line tool to upsert Columbia Pacific Northwest-Region reservoir data
to a PostgreSQL server using ogr2ogr. This is supposed to run as a cron job.

The file [schema.sql](schema.sql) is a required to correctly set up the database.

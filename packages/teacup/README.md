This folder holds all the code for crawling the Teacup CSV data for BoR.

Unlike other packages in this directory structure, this implementation is not used at runtime in pygeoapi.
Instead it serves to create a command line tool to upsert reservoir data
to a PostgreSQL server using ogr2ogr. This is supposed to run as a cron job.

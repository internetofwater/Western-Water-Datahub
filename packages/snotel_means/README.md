This package holds all code for creating a layer for the mean for each huc06 aggregated in the snotel dataset.

This is calculated as:
>  SNOTEL (AWDB EDR) - mean of SWE as % normal at HUC 6 (basically each point use WTEQ/WTEQV * 100) and then take the mean for the HUC 6 the station is in
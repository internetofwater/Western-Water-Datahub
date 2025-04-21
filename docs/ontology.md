# Ontology

The Ontology abstraction layer serves to disambiguate alike ODM2 parameters
across different mapped source systems. This allows user interfaces to
use consistent language when refering to parameters of interest.

The Ontology consists of two separate utilities:

1. **OGC API - Process** that takes in an optional list of ODM2 Vocabulary
   terms. The process formats a version of the `Collections` document, 
   compliant with *http://www.opengis.net/spec/ogcapi-edr-1/1.1/req/collections*,
   with ODM2 parameters and units replacing the native values from the source
   system while staying compliant with [Requirement A.25](https://docs.ogc.org/is/19-086r6/19-086r6.html#req_edr_rc-parameters).
   When the list of ODM2 terms is provided, only terms in that list will 
   be in the returned collections JSON document.

2. **OGC API - EDR** endpoint interceptor that dereferences ODM2 parameters 
   to the parameters of the source system for the EDR Query. This formats
   the returned CoverageJSON from an EDR Query to use the ODM2 parameter
   provided in the request. Should there be multiple unit representations,
   the response Coverages are converted to the requested unit. This will 
   not change the output of the GeoJSON.

### Dashboard

The Reservoir Storage Dashboard allows a streamlined view of Reservoir
Storage Data. Optional additioanl views of precipitation forecast and
streamgage data may also be made availible in this view. In the diagram
below OntologyProcess, SourceEDR1, and SourceEDR2 are all endpoints of
a *single* pygeoapi endpoint.


```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant OntologyProcess
    participant SourceEDR1
    participant SourceEDR2

    %% Initial discovery via process execution
    Dashboard->>OntologyProcess: POST /processes/ontology/execution\n(input: reservoirStorage)
    OntologyProcess->>Dashboard: Return filtered view of Collections JSON document

    %% Loop over URLs to GeoJSON of Reservoirs
    par Task A
        Dashboard->>SourceEDR1: GET /collections/{SourceEDR1}/locations?parameter-name=reservoirStorage
        SourceEDR1->>Dashboard: Return GeoJSON
    and Task B
        Dashboard->>SourceEDR2: GET /collections/{SourceEDR2}/locations?parameter-name=reservoirStorage
        SourceEDR2->>Dashboard: Return GeoJSON
    end

    User->>Dashboard: Select Reservoir of interest
    Dashboard->>SourceEDR1: GET /collections/{SourceEDR1}/locations/{LocationId}?parameter-name=reservoirStorage
    SourceEDR1->>Dashboard: Return CovSON
```

This example uses the Reservoir Storage parameter, representated
at *http://vocabulary.odm2.org/variablename/reservoirStorage/* but is
refered to with shorthand, *reservoirStorage*. The same pattern could
be repeated with *http://vocabulary.odm2.org/variablename/streamflow/* for
streamgage data.

<!-- Precipitation forecast data is not made availible as **OGC API - EDR**. As such,
the layer will not will presentable via the Ontology. The diagram below
illustrates a simple **OGC API - Features** interaction.

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant pygeoapi

    %% Selection of Forecast period of interest (1-7 Days)
    User->>Dashboard: Select Forecast for Days 1, 2, 3, 4-5, or 6-7

    %% Fetch GeoJSON of Forecast
    Dashboard->>pygeoapi: GET /collections/{ForcastPeriod}/items

``` -->

### Hub

The Hub serves as the primary interface to explore and download
data from the Western Water Datahub. It makes greater use out of the 
Ontology layer, with a larger set of possible parameters to filter by.
Furthermore, the Hub is going to enable the full suite of EDR query
parameters by also enable users to filter spatiotemporally.


```mermaid
sequenceDiagram
    participant User
    participant Hub
    participant OntologyProcess
    participant SourceEDR1
    participant SourceEDR2
    participant SourceEDR3

    %% Initial discovery via process execution
    Hub->>OntologyProcess: POST /processes/ontology/execution
    OntologyProcess->>Hub: Return ODM2 representation of Collections JSON document

    User->>Hub: Select parameter(s) or parameter group(s) of interest

    opt Refresh Collections with desired parameters
        Hub->>OntologyProcess: POST /processes/ontology/execution\n(input: streamflow)
        OntologyProcess->>Hub: Return filtered view of Collections JSON document
    end

    User->>Hub: Add additional Spatiotemporal filters

    opt Filter by provider
        User->>Hub: Choose specific provider(s)
        Hub->>SourceEDR1: Drop SourceEDR1 collection metadata
    end

    %% Show locations matching filters
    par Task A
        Hub->>SourceEDR2: GET /collections/{SourceEDR2}/locations?parameter-name=streamflow
        SourceEDR2->>Hub: Return GeoJSON
    and Task B
        Hub->>SourceEDR3: GET /collections/{SourceEDR3}/locations?parameter-name=streamflow
        SourceEDR3->>Hub: Return GeoJSON
    end
    
    User->>Hub: Select Site of interest
    Hub->>SourceEDR1: GET /collections/{SourceEDR2}/locations/{LocationId}?parameter-name=streamflow
    SourceEDR2->>Hub: Return transformed CovJSON
```

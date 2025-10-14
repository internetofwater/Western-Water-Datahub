FROM internetofwater/nabu:latest AS nabu

# Copy and make the script executable
COPY pull_all_graphs.sh /app/pull_all_graphs.sh
RUN chmod +x /app/pull_all_graphs.sh

# Add a cachebust argument to always run this step
ARG CACHEBUST=1

# Persistent directory for pulled graphs
RUN mkdir -p /app/pull_persistent

# Pull graphs into the persistent directory
RUN --mount=type=cache,target=/app/pull_temp \
    --mount=type=secret,id=S3_ACCESS_KEY \
    --mount=type=secret,id=S3_SECRET_KEY \
    /app/pull_all_graphs.sh && \
    # we have to copy the temp pull to the persistent directory
    # since mount cache is not copyable across layers; only regular
    # files are
    cp -r /app/pull_temp/* /app/pull_persistent/

# --- Build the QLever index ---
FROM adfreiburg/qlever:commit-55c05d4

WORKDIR /wwdh_graph
COPY --from=nabu /app/pull_persistent .

RUN echo '{ "num-triples-per-batch": 100000 }' > wwdh_graph.settings.json
RUN cat *.nq | IndexBuilderMain -i . -s wwdh_graph.settings.json -F nq -f -

ENTRYPOINT ["bash", "-c", "ServerMain -i . -j 8 -p 8888 -m 5G -c 2G -e 1G -k 200 -s 30s"]

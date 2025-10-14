FROM internetofwater/nabu:latest AS nabu

# Copy and make the script executable
COPY pull_all_graphs.sh /app/pull_all_graphs.sh
RUN chmod +x /app/pull_all_graphs.sh

# Add a cachebust argument to stop docker from caching
# this is needed since otherwise docker might cache the next
# step of pulling release raphs. this would make it so 
# the newest, updated release graphs may be skipped
ARG CACHEBUST=1

# Persistent directory for pulled graphs
RUN mkdir -p /app/pull_persistent

# Pull graphs into the temp directory
# so that we can use it in the mount cache
# this allows us to not need to download large nq files each time
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

# we can remove data assets; we only need the index in the final image
RUN rm -rf *.nq
RUN rm -rf *.nq.gz

ENTRYPOINT ["bash", "-c", "ServerMain -i . -j 8 -p 8888 -m 5G -c 2G -e 1G -k 200 -s 30s"]

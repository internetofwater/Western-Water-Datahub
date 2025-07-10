# Cloud Deployment Guide

This guide provides general instructions for deploying the Western Water Data Hub (WWDH) to a cloud environment.

## Prerequisites

- An account with a major cloud provider (e.g., AWS, Azure, Google Cloud)
- Permissions to deploy and manage cloud resources (e.g., IAM roles, service accounts)
- Understanding of standard cloud offerings

## Deploy via docker compose

The first possible way to deploy the WWDH is to deploy the stack with Docker Compose inside a
Virtual Machine (AWS EC2, GCP Compute Engine, etc.). This will not scale the services as traffic increases, but
will allow for the deployment of the WWDH with the provisioning of with minimal cloud resources.

### 1. Clone the Repository

```bash
git clone https://github.com/internetofwater/Western-Water-Datahub.git
cd Western-Water-Datahub
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
# Edit .env as needed
```

### 3. Start the Docker Stack

Start all containers

```bash
docker compose --profile production up
```

This will start the Dashboard at `http://localhost:3000` and the API at `http://localhost:5005`

### 4. Configure Webserver

The final step to serve the WWDH publicly is then to configure a webserver of your choice
(nginx, Caddy, Apache, etc) to provide TLS to the various components.

## Deploy with Cloud Native Components

The second possible way to deploy the WWDH is using cloud native components. We are only using
services made available by all major cloud providers.

### 1. Build and Push Docker Images

Clone the Repository:

```bash
git clone https://github.com/internetofwater/Western-Water-Datahub.git
cd Western-Water-Datahub
```

Build the Docker image:

```bash
docker build -t <your-container-registry>/WWDH-API:latest .
```

Push the image to your cloud provider's container registry:

```bash
docker push <your-container-registry>/WWDH-API:latest
```

Repeat this step to create and publish images for the user interfaces.

```bash
cd dashboard-ui
docker build -t <your-container-registry>/WWDH-DASHBOARD:latest .
docker push <your-container-registry>/WWDH-DASHBOARD:latest
```

### 2. Provision Redis Cache

The WWDH relies on a Redis cache to serve static data from remote sources. This can be done using managed Redis services from major cloud providers:

- **Google Cloud:** [Memorystore for Redis documentation](https://cloud.google.com/memorystore/docs/redis)
- **AWS:** [Amazon ElastiCache for Redis documentation](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html)
- **Azure:** [Azure Cache for Redis documentation](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/)

Record the IP address or endpoint of the cache and ensure it is accessible from the API via a public or private network.

### 3. Provision SQL Database

The WWDH stores file-based systems in a PostgreSQL database to efficiently serve them as OGC API - EDR. You can use managed PostgreSQL services from major cloud providers:

- **Google Cloud:** [Cloud SQL for PostgreSQL documentation](https://cloud.google.com/sql/docs/postgres)
- **AWS:** [Amazon RDS for PostgreSQL documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- **Azure:** [Azure Database for PostgreSQL documentation](https://learn.microsoft.com/en-us/azure/postgresql/)

Create a table in the database using the SQL table schema: [schema.sql](/packages/resviz/schema.sql)

Record the IP address and access credentials of the SQL database. Ensure it is accessible from the API via a public or private network.

### 4. Provision OpenTelemetry Monitoring

Set up monitoring and observability for your deployment using OpenTelemetry. Most cloud providers offer managed solutions or integrations for collecting metrics, traces, and logs.

- For GCP, use [Cloud Monitoring and Trace](https://cloud.google.com/monitoring/docs).
- For AWS, use [CloudWatch with OpenTelemetry Collector](https://docs.aws.amazon.com/eks/latest/userguide/otel-collector.html).
- For Azure, use [Azure Monitor with OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-overview).

Configure your application to export telemetry data to your chosen monitoring backend.

### 5. Deploy Using Cloud-Native Container Services

Deploy your container images using your cloud provider's scalable container service, such as Cloud Run (GCP), Fargate (AWS), or Azure Container Apps.

**Deployment order:**

1. Deploy the API container first.
2. Deploy the user interface containers after the API is running.

**Environment variables:**  
When configuring each container, provide all relevant environment variables recorded from previous steps, including:

- Redis cache connection details
- SQL database host, credentials, and schema
- Any other required application settings

Refer to your provider's documentation for detailed deployment steps:

- [Google Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts)
- [AWS Fargate Getting Started](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started-fargate.html)
- [Azure Container Apps Quickstart](https://learn.microsoft.com/en-us/azure/container-apps/get-started)

After deployment, configure networking, environment variables, and secrets as needed to connect your services to the Redis cache and SQL database.

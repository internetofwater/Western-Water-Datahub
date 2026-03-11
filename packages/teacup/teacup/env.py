# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT

import os

# CSV base URL
BASE_URL = (
    "https://www.hydroshare.org/resource/22b2f10103e5426a837defc00927afbd/data/contents"
)

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", 5432)
POSTGRES_DB = os.getenv("POSTGRES_DB", "edr")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")

POSTGRES_URL = str(
    f"PG:dbname={POSTGRES_DB} host={POSTGRES_HOST} port={POSTGRES_PORT} user={POSTGRES_USER} password={POSTGRES_PASSWORD}"  # noqa
)

#!/bin/sh
# Copyright 2025 Lincoln Institute of Land Policy
# SPDX-License-Identifier: MIT


. /opt/container.env

exec resviz >> /var/log/resviz-cron.log 2>&1

#!/bin/sh

. /opt/container.env

exec resviz >> /var/log/resviz-cron.log 2>&1

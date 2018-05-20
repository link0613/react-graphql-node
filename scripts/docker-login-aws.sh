#!/bin/sh

echo '[docker-login-aws] Requesting Docker login credentials from AWS';
$(aws ecr get-login --no-include-email)

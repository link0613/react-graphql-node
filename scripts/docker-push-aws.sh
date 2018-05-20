#!/bin/sh

echo '[docker-push-aws] Tagging Docker image for AWS ECR';
docker tag $(docker images athena:latest -q) 953165354042.dkr.ecr.us-west-2.amazonaws.com/athena

echo '[docker-push-aws] Pushing Docker image into AWS ECR';
docker push 953165354042.dkr.ecr.us-west-2.amazonaws.com/athena

# HX Athena

FireEye HX Athena application.

## Installation

Used to install all dependencies.
```bash
npm install
```

## Running

#### Start a local server:
Runs on 3000 port (http://localhost:3000), also makes GraphQL accessible via 8000 port (http://localhost:8000). 

```bash
npm start
```

## [out-of-sync] Running with Docker Compose
Warning! Could be temporarily out of sync with most recent infrastructure, advice you to use Docker instead.

```bash
docker-compose up
```

## Operations

#### Build Docker image

```bash
npm run docker:build
```

#### Run Docker image with only basic port mapping

```bash
npm run docker:run
```

#### Run Docker image with complete port mapping

Runs Docker with following port mapping:

* 3000:80 (Web interface)
* 3001:8000 (GraphQL)
* 3002:5672 (Rabbit control port)
* 3003:15672 (Rabbit management utility)
* 3004:9200 (Elasticsearch)

Such configuration picked to prevent conflicts with locally running instances of corresponding services.

```bash
npm run docker:run:full
```

#### Tag local Docker image and push it to AWS ECR repository

```bash
npm run docker:deploy
```

#### Rebuild local Docker image, tag and push it to AWS ECR

```bash
npm run docker:deploy:full
```

## Developing

Any changes you make to files in the `js/` directory will cause the server to
automatically rebuild the app and refresh your browser.

If at any time you make changes to `data/schema.js`, stop the server,
regenerate `data/schema.graphql`, and restart the server:

```
npm start
```

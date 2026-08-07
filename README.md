<div>
<picture style="width:5rem">
  <source media="(prefers-color-scheme: dark)" srcset="./game-engine.webapp/public/univaq-logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./game-engine.webapp/public/univaq-logo-light.png">
  <img style="width:5rem" alt="Univaq Logo" src="./game-engine.webapp/public/univaq-logo-dark.png">
</picture>
<picture style="width:6rem">
  <source media="(prefers-color-scheme: dark)" srcset="./game-engine.webapp/public/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./game-engine.webapp/public/logo-light.png">
  <img style="width:6rem" alt="GamificationHub Icon" src="./game-engine.webapp/public/logo-dark.png">
</picture>
<picture style="width:30rem">
  <source media="(prefers-color-scheme: dark)" srcset="./game-engine.webapp/public/app-logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="./game-engine.webapp/public/app-logo-light.png">
  <img style="width:30rem" alt="GamificationHub Logo" src="./game-engine.webapp/public/app-logo-dark.png">
</picture>
</div>

GamificationHub is a platform that permits to define and execute score based games.
## Tech Stack

**Backend**

![Java](https://img.shields.io/badge/Java-25-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-6DB33F?logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?logo=apachemaven&logoColor=white)
![Drools](https://img.shields.io/badge/Drools-Rule%20Engine-A30000?logo=redhat&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

**Frontend**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)

**Infrastructure & Observability**

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?logo=grafana&logoColor=white)
![Loki](https://img.shields.io/badge/Loki-F5A800?logo=grafana&logoColor=white)

## Components
* [game-engine.core](game-engine.core): Drools rule engine implementation and domain models
* [game-engine.api](game-engine.api): Spring Boot REST API and security layer
* [game-engine.webapp](game-engine.webapp): React + Vite admin web interface
* [monitoring](monitoring): Prometheus, Grafana, Loki and Alloy configuration for observability
* [documentation](documentation): project documentation and API migration notes


## Running the application

The application has three parts: MongoDB (plus optional monitoring), the `game-engine.api` backend and the `game-engine.webapp` frontend.

### Prerequisites
* JDK 25 and Maven 3.9+
* Node.js 20+ and npm
* Docker and Docker Compose

### 1. Start the infrastructure
From the repository root, use `docker-compose.local.yaml` — the local-development compose file, which includes MongoDB (and the monitoring stack):
```
docker compose -f docker-compose.local.yaml up -d mongo
```
MongoDB is exposed on `localhost:50000`.

### 2. Start the backend API
From `game-engine.api`, run the Spring Boot app (defaults to the `local` profile, listens on port `8081`):
```
cd game-engine.api
mvn spring-boot:run
```

### 3. Start the frontend webapp
From `game-engine.webapp`, install dependencies and start the Vite dev server:
```
cd game-engine.webapp
npm install
npm run dev
```
The dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend on port `8081`.

### Running everything with Docker (local development)
Alternatively, build and run the full stack (MongoDB, API, webapp and monitoring) with `docker-compose.local.yaml` — this is the compose file meant for local development; it bundles the split `docker-compose.api.yaml`, `docker-compose.frontend.yaml` and `docker-compose.monitoring.yaml` together with a local-only MongoDB:
```
docker compose -f docker-compose.local.yaml up --build
```

The API takes a .env.prod file to run. Ask the administrator to provid the file as it contains sensitive information.

### Deployment

`docker-compose.api.yaml`, `docker-compose.frontend.yaml` and `docker-compose.monitoring.yaml` are deployed separately (e.g. as three Coolify resources) and don't include MongoDB — it's expected to run as its own managed database resource. Keeping monitoring apart means it can be redeployed without restarting the API; the two reach each other over `host.docker.internal`. See [documentation](documentation) for details.

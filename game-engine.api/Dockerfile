# ==========================
# Build stage
# ==========================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

RUN mkdir game-engine.api
RUN mkdir game-engine.core

COPY game-engine.api/src ./game-engine.api/src
COPY game-engine.api/pom.xml ./game-engine.api
COPY game-engine.core/src ./game-engine.core/src
COPY game-engine.core/pom.xml ./game-engine.core

# Copy Maven files first for better layer caching
COPY pom.xml .


# Download dependencies
#RUN mvn dependency:go-offline

# Build application
RUN mvn clean package -DskipTests

# ==========================
# Runtime stage
# ==========================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the built jar
COPY --from=builder /app/game-engine.api/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
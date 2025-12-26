FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY backend/pom.xml ./backend/

WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.m2 mvn dependency:go-offline -B

WORKDIR /app
COPY backend/src ./backend/src
COPY frontend ./frontend

RUN rm -f frontend/package-lock.json

WORKDIR /app/backend
RUN --mount=type=cache,target=/root/.m2 mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
# Builder stage
FROM eclipse-temurin:25-jdk-ubi10-minimal AS builder
WORKDIR /application
COPY target/app-exec.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

# Runtime stage
FROM eclipse-temurin:25-jre

ENV JAVA_OPTS="-Xmx850m \
               -Djava.security.egd=file:/dev/./urandom"

WORKDIR /app
COPY run-java.sh /

COPY --from=builder /application/extracted/dependencies/ ./
RUN true
COPY --from=builder /application/extracted/snapshot-dependencies/ ./
RUN true
COPY --from=builder /application/extracted/spring-boot-loader/ ./
RUN true
COPY --from=builder /application/extracted/application/ ./

CMD ["/run-java.sh"]

set -x
exec java \
${DEFAULT_JVM_OPTS} \
${JAVA_OPTS} \
-server \
${RUNTIME_OPTS} \
-jar /app/application.jar \
$@
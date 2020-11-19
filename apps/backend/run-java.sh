set -x
exec java \
${DEFAULT_JVM_OPTS} \
${JAVA_OPTS} \
-server \
-cp . \
${MAIN_CLASS} \
${RUNTIME_OPTS} \
$@
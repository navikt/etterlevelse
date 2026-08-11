package no.nav.data.etterlevelse.graphql;

import graphql.ExceptionWhileDataFetching;
import graphql.ExecutionResult;
import graphql.GraphQLError;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.InstrumentationState;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.SimplePerformantInstrumentation;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.JsonUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Component
@RequiredArgsConstructor
public class RequestLoggInstrumentation extends SimplePerformantInstrumentation {

    @Override
    public InstrumentationContext<ExecutionResult> beginExecution(InstrumentationExecutionParameters parameters, InstrumentationState state) {
        var start = Instant.now();

        log.info("Query: {} with variables: {}", parameters.getQuery(), parameters.getVariables());
        return SimpleInstrumentationContext.whenCompleted((executionResult, throwable) -> {
            var duration = Duration.between(start, Instant.now());
            if (throwable == null) {
                if (executionResult.getErrors().isEmpty()) {
                    log.info("Completed successfully in: {}", duration);
                } else {
                    log.warn("Completed with {} GraphQL error(s) errors={}",
                            executionResult.getErrors().size(),
                            JsonUtils.toJson(convert(executionResult.getErrors(), GraphQLError::toSpecification)));

                    for (int i = 0; i < executionResult.getErrors().size(); i++) {
                        var error = executionResult.getErrors().get(i);
                        var dataAtPath = extractDataAtPath(executionResult.getData(), error.getPath());

                        if (error instanceof ExceptionWhileDataFetching dataFetchingError && dataFetchingError.getException() != null) {
                            log.error("GraphQL error #{} type={} path={} locations={} message={} dataAtPath={} extensions={}\nStack trace:\n{}",
                                    i + 1,
                                    error.getClass().getSimpleName(),
                                    error.getPath(),
                                    error.getLocations(),
                                    error.getMessage(),
                                    JsonUtils.toJson(dataAtPath),
                                    JsonUtils.toJson(error.getExtensions()),
                                    ExceptionUtils.getStackTrace(dataFetchingError.getException()));
                        } else {
                            log.warn("GraphQL error #{} type={} path={} locations={} message={} dataAtPath={} extensions={} payload={}",
                                    i + 1,
                                    error.getClass().getSimpleName(),
                                    error.getPath(),
                                    error.getLocations(),
                                    error.getMessage(),
                                    JsonUtils.toJson(dataAtPath),
                                    JsonUtils.toJson(error.getExtensions()),
                                    JsonUtils.toJson(error.toSpecification()));
                        }
                    }
                }
            } else {
                log.error("Failed in: {}", duration, throwable);
            }
        });
    }

    private Object extractDataAtPath(Object data, List<Object> path) {
        if (data == null || path == null || path.isEmpty()) {
            return data;
        }

        Object current = data;
        for (Object segment : path) {
            if (current instanceof Map<?, ?> map) {
                current = map.get(segment);
            } else if (current instanceof List<?> list && segment instanceof Number number) {
                int index = number.intValue();
                if (index < 0 || index >= list.size()) {
                    return null;
                }
                current = list.get(index);
            } else {
                return null;
            }
        }

        return current;
    }

}
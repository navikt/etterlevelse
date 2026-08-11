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
import java.util.Objects;

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
                    log.warn("Completed with errors in: {} - {}", duration, JsonUtils.toJson(convert(executionResult.getErrors(), GraphQLError::toSpecification)));
                    executionResult.getErrors()
                            .forEach(error -> {
                                if (error instanceof ExceptionWhileDataFetching dataFetchingError && Objects.nonNull(dataFetchingError.getException())) {
                                    log.warn("Internal GraphQL error at path {}: {}", dataFetchingError.getPath(), dataFetchingError.getException().getMessage(), dataFetchingError.getException());
                                } else {
                                    String stackTrace = error instanceof ExceptionWhileDataFetching e && e.getException() != null
                                            ? ExceptionUtils.getStackTrace(e.getException())
                                            : "(no exception attached)";
                                    log.warn("GraphQL error type={} payload={}\nStack trace:\n{}", error.getClass().getSimpleName(), JsonUtils.toJson(error.toSpecification()), stackTrace);
                                }
                            });
                }
            } else {
                log.error("Failed in: {}", duration, throwable);
            }
        });
    }

}
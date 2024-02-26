package no.nav.data.etterlevelse.graphql;

import graphql.ExecutionResult;
import graphql.GraphQLError;
import graphql.execution.instrumentation.InstrumentationContext;
import graphql.execution.instrumentation.SimpleInstrumentationContext;
import graphql.execution.instrumentation.SimplePerformantInstrumentation;
import graphql.execution.instrumentation.parameters.InstrumentationExecutionParameters;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.utils.JsonUtils;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

import static no.nav.data.common.utils.StreamUtils.convert;

@Slf4j
@Component
@RequiredArgsConstructor
public class RequestLoggInstrumentation extends SimplePerformantInstrumentation {

    @Override
    public InstrumentationContext<ExecutionResult> beginExecution(InstrumentationExecutionParameters parameters) {
        var start = Instant.now();

        log.info("Query: {} with variables: {}", parameters.getQuery(), parameters.getVariables());
        return SimpleInstrumentationContext.whenCompleted((executionResult, throwable) -> {
            var duration = Duration.between(start, Instant.now());
            if (throwable == null) {
                if (executionResult.getErrors().isEmpty()) {
                    log.info("Completed successfully in: {}", duration);
                } else {
                    log.warn("Completed with errors in: {} - {}", duration, JsonUtils.toJson(convert(executionResult.getErrors(), GraphQLError::toSpecification)));
                }
            } else {
                log.error("Failed in: {}", duration, throwable);
            }
        });
    }

}
package no.nav.data.etterlevelse.graphql;

import graphql.GraphQLError;
import graphql.GraphqlErrorException;
import graphql.schema.DataFetchingEnvironment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class GraphQlLoggingExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(@NonNull Throwable ex, DataFetchingEnvironment env) {
        String path = env.getExecutionStepInfo().getPath().toString();
        Map<String, Object> arguments = env.getArguments();

        // Scenario 1: Handle specific Business/Validation Errors (Client-side faults)
        if (ex instanceof IllegalArgumentException) {
            log.warn("GraphQL Client Error -> Path: [{}], Args: {}, Message: {}",
                    path, arguments, ex.getMessage());

            return GraphqlErrorException.newErrorException()
                    .errorClassification(ErrorType.BAD_REQUEST)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath().toList())
                    .build();
        } else {
            // Scenario 2: Handle unexpected system failures (Server-side faults)
            // This captures GraphqlErrorImpl or native runtime faults securely
            log.error("GraphQL Server Error -> Path: [{}], Args: {}, Cause: ",
                    path, arguments, ex);

            // Sanitize the response: Do NOT leak internal stack traces to the client
            return GraphqlErrorException.newErrorException()
                    .errorClassification(ErrorType.INTERNAL_ERROR)
                    .message("An internal server error occurred.")
                    .path(env.getExecutionStepInfo().getPath().toList())
                    .build();
        }
    }
}
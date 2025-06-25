package no.nav.data.common.graphql;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import java.util.Map;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public record GraphQLRequest(
        String query,
        Map<String, Object> variables
) {

    public GraphQLRequest(String query) {
        this(query, Map.of());
    }
}

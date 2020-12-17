package no.nav.data.graphql;

import com.fasterxml.jackson.databind.JsonNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import org.assertj.core.api.AbstractAssert;
import org.springframework.util.CollectionUtils;

import java.util.List;

public class GraphQLAssert extends AbstractAssert<GraphQLAssert, GraphQLResponse> {

    private final String queryName;

    private GraphQLAssert(GraphQLResponse graphQLResponse, Class<?> selfType, String queryName) {
        super(graphQLResponse, selfType);
        this.queryName = queryName;
    }

    public static GraphQLAssert assertThat(GraphQLResponse response, String queryName) {
        return new GraphQLAssert(response, GraphQLAssert.class, queryName);
    }

    public GraphQLAssert hasNoErrors() {
        isNotNull();
        if (actual.getRawResponse().getBody().contains("errors")) {
            failWithMessage("Feil %s", actual.getList("$.errors", JsonNode.class).toString());
        }
        return this;
    }

    public GraphQLAssert hasErrors() {
        List<JsonNode> errors = actual.getList("$.errors", JsonNode.class);
        if (CollectionUtils.isEmpty(errors)) {
            failWithMessage("Expected errors");
        }
        return this;
    }

    public GraphQLAssert hasField(String field, String value) {
        isNotNull();
        var actualValue = actual.get("$.data.%s.%s".formatted(queryName, field));
        objects.assertEqual(info, actualValue, value);
        return this;
    }

    public GraphQLAssert hasSize(int i) {
        return hasSize(null, i);
    }

    public GraphQLAssert hasSize(String path, int i) {
        isNotNull();
        objects.assertEqual(info, actual.get("$.data.%s%s.length()".formatted(path == null ? "" : "." + path, queryName), int.class), i);

        return this;
    }
}

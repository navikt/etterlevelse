package no.nav.data.graphql;

import com.fasterxml.jackson.databind.JsonNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import org.assertj.core.api.AbstractAssert;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.function.Consumer;

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
        String actualValue = getValue(field);
        objects.assertEqual(info, actualValue, value);
        return this;
    }

    public GraphQLAssert hasField(String field, Consumer<String> consumer) {
        String actualValue = getValue(field);
        consumer.accept(actualValue);
        return this;
    }

    private String getValue(String field) {
        isNotNull();
        String path = "$.data.%s.%s".formatted(queryName, field);
        String actualValue = null;
        try {
            actualValue = actual.get(path);
        } catch (Exception e) {
            fail(e);
        }
        return actualValue;
    }

    public GraphQLAssert hasSize(int i) {
        return hasSize(null, i);
    }

    public GraphQLAssert hasSize(String path, int i) {
        isNotNull();
        String lengthPath = "$.data.%s%s.length()".formatted(queryName, path == null ? "" : "." + path);
        try {
            objects.assertEqual(info, actual.get(lengthPath, int.class), i);
        } catch (Exception e) {
            fail(e);
        }
        return this;
    }

    private void fail(Exception e) {
        String msg = "jsonpath error for body <" + actual.getRawResponse().getBody() + ">";
        throw failure(e.getMessage() + "\n" + msg);
    }

}

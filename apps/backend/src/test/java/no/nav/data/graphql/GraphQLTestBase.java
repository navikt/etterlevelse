package no.nav.data.graphql;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLTestTemplate;
import no.nav.data.IntegrationTestBase;
import no.nav.data.common.utils.JsonUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

public abstract class GraphQLTestBase extends IntegrationTestBase {

    private final ObjectMapper om = JsonUtils.getObjectMapper();

    @Autowired
    protected GraphQLTestTemplate graphQLTestTemplate;

    protected ObjectNode vars() {
        return om.createObjectNode();
    }

    protected ObjectNode vars(Map<String, ?> map) {
        var on = om.createObjectNode();
        map.forEach((key, val) -> on.set(key, JsonUtils.toJsonNode(val)));
        return on;
    }
}

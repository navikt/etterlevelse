package no.nav.data.graphql;

import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLTestTemplate;
import no.nav.data.IntegrationTestBase;
import no.nav.data.common.utils.JsonUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

public abstract class GraphQLTestBase extends IntegrationTestBase {

    @Autowired
    protected GraphQLTestTemplate graphQLTestTemplate;

    protected ObjectNode vars() {
        ObjectReader or = JsonUtils.getObjectReader();
        return or.getConfig().getNodeFactory().objectNode();
    }

    protected ObjectNode vars(Map<String, ?> map) {
        var on = vars();
        map.forEach((key, val) -> on.set(key, JsonUtils.toJsonNode(val)));
        return on;
    }
}

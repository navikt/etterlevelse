package no.nav.data.graphql;

import com.graphql.spring.boot.test.GraphQLTestTemplate;
import no.nav.data.IntegrationTestBase;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class GraphQLTestBase extends IntegrationTestBase {

    @Autowired
    protected GraphQLTestTemplate graphQLTestTemplate;
}

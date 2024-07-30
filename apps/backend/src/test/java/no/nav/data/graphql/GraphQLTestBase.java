package no.nav.data.graphql;

import no.nav.data.IntegrationTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;


public abstract class GraphQLTestBase extends IntegrationTestBase {

    @Autowired
    protected WebApplicationContext webApplicationContext;

    public HttpGraphQlTester graphQltester;

    @BeforeEach
    void setup () {
        WebTestClient client = MockMvcWebTestClient.bindToApplicationContext(webApplicationContext)
                .configureClient()
                .baseUrl("/graphql")
                .build();

        graphQltester = HttpGraphQlTester.create(client);
    }

}
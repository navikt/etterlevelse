package no.nav.data.graphql;

import no.nav.data.IntegrationTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.http.codec.json.JacksonJsonDecoder;
import org.springframework.http.codec.json.JacksonJsonEncoder;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;

import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;


public abstract class GraphQLTestBase extends IntegrationTestBase {

    @Autowired
    protected WebApplicationContext webApplicationContext;

    public HttpGraphQlTester graphQltester;

    @BeforeEach
    void setup () {
        // Spring Boot 4 uses Jackson 3; the default tester decoder enables FAIL_ON_NULL_FOR_PRIMITIVES,
        // so null JSON values for primitive DTO fields would fail. Use a lenient mapper to mirror prod config.
        JsonMapper lenientMapper = JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
                .build();
        WebTestClient client = MockMvcWebTestClient.bindToApplicationContext(webApplicationContext)
                .configureClient()
                .baseUrl("/graphql")
                .codecs(configurer -> {
                    configurer.defaultCodecs().jacksonJsonDecoder(new JacksonJsonDecoder(lenientMapper));
                    configurer.defaultCodecs().jacksonJsonEncoder(new JacksonJsonEncoder(lenientMapper));
                })
                .build();

        graphQltester = HttpGraphQlTester.create(client);
    }

}
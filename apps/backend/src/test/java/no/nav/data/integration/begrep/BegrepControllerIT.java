package no.nav.data.integration.begrep;

import no.nav.data.IntegrationTestBase;
import no.nav.data.integration.begrep.BegrepController.BegrepPage;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class BegrepControllerIT extends IntegrationTestBase {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void getBegrep() {
        var begrep = restTemplate.getForEntity("/begrep/{termId}", BegrepResponse.class, "TERM-1");
        assertThat(begrep.getBody()).isNotNull();
        assertThat(begrep.getBody().getId()).isEqualTo("TERM-1");
        assertThat(begrep.getBody().getNavn()).isEqualTo("Term 1 Name");
        assertThat(begrep.getBody().getBeskrivelse()).isEqualTo("Term 1");
    }

    @Test
    void getBegrepNotFound() {
        assertThat(restTemplate.getForEntity("/begrep/{termId}", String.class, "not-found").getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void searchBegreper() {
        var begreper = restTemplate.getForEntity("/begrep/search/{name}", BegrepPage.class, "term");
        assertThat(begreper.getBody()).isNotNull();
        assertThat(begreper.getBody().getContent()).hasSize(1);
        assertThat(begreper.getBody().getContent().get(0).getId()).isEqualTo("TERM-1");
    }

}

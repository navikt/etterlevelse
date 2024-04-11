package no.nav.data.integration.begrep;

import no.nav.data.IntegrationTestBase;
import no.nav.data.integration.begrep.BegrepController.BegrepPage;
import no.nav.data.integration.begrep.dto.BegrepResponse;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class BegrepControllerIT extends IntegrationTestBase {

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
        var begrep = restTemplate.getForEntity("/begrep/{termId}", BegrepResponse.class, "Ukjent-Begrep");
        assertThat(begrep.getBody()).isNotNull();
        assertThat(begrep.getBody().getId()).isEqualTo("Ukjent-Begrep");
        assertThat(begrep.getBody().getNavn()).isEqualTo("Finner ikke begrep for id: Ukjent-Begrep");
        assertThat(begrep.getBody().getBeskrivelse()).isEqualTo("Finner ikke beskrivelse for id");
    }

    @Test
    void searchBegreper() {
        var begreper = restTemplate.getForEntity("/begrep/search/{name}", BegrepPage.class, "term");
        assertThat(begreper.getBody()).isNotNull();
        assertThat(begreper.getBody().getContent()).hasSize(1);
        assertThat(begreper.getBody().getContent().get(0).getId()).isEqualTo("TERM-1");
    }

}

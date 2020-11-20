package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.IntegrationTestBase;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class KravRepoTest extends IntegrationTestBase {

    @Test
    void saveKrav() {
        var krav = storageService.save(Krav.builder().build());
        assertThat(krav.getVersion()).isEqualTo(0);

        krav.setKortNavn("krav 1");
        krav = storageService.save(krav);
        assertThat(krav.getVersion()).isEqualTo(1);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(krav.getId().toString());
        assertThat(audits).hasSize(2);
        assertThat(audits.get(0).getVersion()).isEqualTo(1);
        assertThat(audits.get(1).getVersion()).isEqualTo(0);
    }
}
package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.IntegrationTestBase;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class KravRepoTest extends IntegrationTestBase {

    @Test
    void saveKrav() {
        var krav = kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(50).kravVersjon(0).build());
        assertThat(krav.getVersion()).isEqualTo(0);

        krav.setNavn("krav 1");
        krav = kravService.save(krav);
        assertThat(krav.getVersion()).isEqualTo(1);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(krav.getId().toString());
        assertThat(audits).hasSize(2);
        assertThat(audits.get(0).getVersion()).isEqualTo(1);
        assertThat(audits.get(1).getVersion()).isEqualTo(0);

        assertThat(kravRepo.count()).isOne();
    }
}
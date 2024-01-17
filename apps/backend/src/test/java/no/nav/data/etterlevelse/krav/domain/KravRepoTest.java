package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;

class KravRepoTest extends IntegrationTestBase {

    @Test
    void saveKrav() {
        var krav = kravStorageService.save(Krav.builder().build());
        assertThat(krav.getVersion()).isEqualTo(0);

        krav.setNavn("krav 1");
        krav = kravStorageService.save(krav);
        assertThat(krav.getVersion()).isEqualTo(1);

        var audits = auditVersionRepository.findByTableIdOrderByTimeDesc(krav.getId().toString());
        assertThat(audits).hasSize(2);
        assertThat(audits.get(0).getVersion()).isEqualTo(1);
        assertThat(audits.get(1).getVersion()).isEqualTo(0);

        assertThat(kravStorageService.getAll(Krav.class, PageRequest.of(0, 10, Sort.by("id"))).getTotalElements()).isOne();
    }
}
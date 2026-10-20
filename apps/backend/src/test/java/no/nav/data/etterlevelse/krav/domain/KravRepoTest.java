package no.nav.data.etterlevelse.krav.domain;

import no.nav.data.IntegrationTestBase;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import org.junit.jupiter.api.Test;

import java.util.List;
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

    @Test
    void findBy_shouldHideSupersededVersionEvenWhenNewerVersionDoesNotMatchFilter() {
        saveKrav(50, 1, KravStatus.UTGAATT, List.of("SAK"), "ARKIV");
        saveKrav(50, 2, KravStatus.AKTIV, List.of(), "ARKIV");
        saveKrav(51, 1, KravStatus.AKTIV, List.of("SAK"), "ARKIV");

        var result = kravRepo.findBy(KravFilter.builder().relevans(List.of("SAK")).build());

        assertThat(result).extracting(Krav::getKravNummer).containsExactly(51);
    }

    @Test
    void findBy_gjeldendeKrav_shouldHideSupersededVersionEvenWhenNewerVersionDoesNotMatchFilter() {
        saveKrav(50, 1, KravStatus.AKTIV, List.of("SAK"), "ARKIV");
        saveKrav(50, 2, KravStatus.AKTIV, List.of(), "ARKIV");

        var result = kravRepo.findBy(KravFilter.builder().relevans(List.of("SAK")).gjeldendeKrav(true).build());

        assertThat(result).isEmpty();
    }

    @Test
    void findBy_statusFilter_shouldNotLetVersionWithOtherStatusHideMatchingVersion() {
        saveKrav(50, 1, KravStatus.AKTIV, List.of("SAK"), "ARKIV");
        saveKrav(50, 2, KravStatus.UNDER_ARBEID, List.of("SAK"), "ARKIV");

        var result = kravRepo.findBy(KravFilter.builder().status(List.of(KravStatus.UNDER_ARBEID.name())).build());

        assertThat(result).extracting(Krav::getKravVersjon).containsExactly(2);
    }

    @Test
    void findBy_withoutStatus_shouldShowNewUtkastVersionNextToAktivVersion() {
        saveKrav(50, 1, KravStatus.AKTIV, List.of("SAK"), "ARKIV");
        saveKrav(50, 2, KravStatus.UTKAST, List.of("SAK"), "ARKIV");

        var result = kravRepo.findBy(KravFilter.builder().relevans(List.of("SAK")).build());

        assertThat(result).extracting(Krav::getKravVersjon).containsExactlyInAnyOrder(1, 2);
    }

    @Test
    void findByRelevansAndLov_shouldReturnAllVersions() {
        saveKrav(50, 1, KravStatus.UTGAATT, List.of("SAK"), "ARKIV");
        saveKrav(50, 2, KravStatus.AKTIV, List.of("SAK"), "ARKIV");

        assertThat(kravRepo.findByRelevans("SAK")).extracting(Krav::getKravVersjon).containsExactlyInAnyOrder(1, 2);
        assertThat(kravRepo.findByLov("ARKIV")).extracting(Krav::getKravVersjon).containsExactlyInAnyOrder(1, 2);
    }

    private void saveKrav(int kravNummer, int kravVersjon, KravStatus status, List<String> relevansFor, String lov) {
        kravService.save(Krav.builder().id(UUID.randomUUID()).kravNummer(kravNummer).kravVersjon(kravVersjon)
                .data(KravData.builder()
                        .navn("Krav " + kravNummer)
                        .status(status)
                        .relevansFor(relevansFor)
                        .regelverk(List.of(Regelverk.builder().lov(lov).spesifisering("§1").build()))
                        .build())
                .build());
    }
}

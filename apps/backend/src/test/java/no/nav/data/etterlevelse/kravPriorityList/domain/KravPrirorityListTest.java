package no.nav.data.etterlevelse.kravPriorityList.domain;

import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.export.domain.EtterlevelseMedKravData;
import no.nav.data.etterlevelse.kravprioritylist.domain.KravPriorityList;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

public class KravPrirorityListTest {

    @Test
    void sortByPriorityUsingComparator() {
        KravPriorityList kravPriorityList =
                KravPriorityList.builder()
                        .id(UUID.randomUUID())
                        .temaId("PERSONVERN")
                        .priorityList(List.of(106, 105))
                        .build();

        var etterlevelseMedKravData1 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(105).kravVersjon(1).build()
                )
                .build();
        var etterlevelseMedKravData2 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(105).kravVersjon(2).build()
                )
                .build();
        var etterlevelseMedKravData3 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(105).kravVersjon(3).build()
                )
                .build();

        var etterlevelseMedKravData4 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(106).kravVersjon(3).build()
                )
                .build();

        var etterlevelseMedKravData5 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(107).kravVersjon(3).build()
                )
                .build();

        var etterlevelseMedKravData6 = EtterlevelseMedKravData.builder()
                .etterlevelseData(
                        Etterlevelse.builder().kravNummer(108).kravVersjon(3).build()
                )
                .build();

        List<EtterlevelseMedKravData> etterlevelseMedKravData = List.of(etterlevelseMedKravData6, etterlevelseMedKravData5, etterlevelseMedKravData1, etterlevelseMedKravData2, etterlevelseMedKravData3, etterlevelseMedKravData4);

        etterlevelseMedKravData = etterlevelseMedKravData.stream().sorted(kravPriorityList.comparator()).toList();

        List<String> sortedKrav = etterlevelseMedKravData.stream().map(e -> e.getEtterlevelseData().getKravNummer() + "." + e.getEtterlevelseData().getKravVersjon()).toList();
        List<String> expected = List.of("106.3", "105.3", "105.2", "105.1", "108.3", "107.3");

        assertThat(sortedKrav).isEqualTo(expected);
    }
}

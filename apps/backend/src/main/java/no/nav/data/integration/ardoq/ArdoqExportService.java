package no.nav.data.integration.ardoq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelse.EtterlevelseService;
import no.nav.data.etterlevelse.etterlevelse.domain.Etterlevelse;
import no.nav.data.etterlevelse.etterlevelse.domain.EtterlevelseStatus;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.integration.ardoq.domain.ArdoqExportField;
import no.nav.data.integration.ardoq.dto.ArdoqSystemResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqExportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final ArdoqClient ardoqClient;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;

    @Value("${etterlev.frontend.url}")
    private String frontendUrl;


    public List<ArdoqExportField> getColumnData() {
        List<Krav> aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<ArdoqSystemResponse> systemer = ardoqClient.getAllArdoqSystems();
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = etterlevelseDokumentasjonService.getEtterlevelseDokumentasjonerWithSystem();
        List<ArdoqExportField> ardoqExportFields = new ArrayList<>();

        etterlevelseDokumentasjonMedSystem.forEach(dokumentasjon -> {

            List<Etterlevelse> etterlevelserForDok = etterlevelseService.getByEtterlevelseDokumentasjon(dokumentasjon.getId());
            List<Krav> kravForEdok = new ArrayList<>(aktivKrav.stream().filter(k ->
                    !new HashSet<>(dokumentasjon.getIrrelevansFor()).containsAll(k.getRelevansFor()) || k.getRelevansFor().isEmpty()
            ).toList());

            List<Etterlevelse> aktivEtterlevelserForDok = etterlevelserForDok.stream().filter(e ->  aktivKrav.stream().anyMatch(k ->
                    k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon()))).toList();

            long etterlevelseNotInKravForEdok = aktivEtterlevelserForDok.stream()
                    .filter(e -> kravForEdok.stream().noneMatch(k ->
                            k.getKravNummer().equals(e.getKravNummer()) && k.getKravVersjon().equals(e.getKravVersjon())))
                    .count();

            int totalKravForEdok = kravForEdok.size() + (int) etterlevelseNotInKravForEdok;

            var oppfyltEtterlevelseList = aktivEtterlevelserForDok.stream()
                    .filter(e -> e.getStatus() == EtterlevelseStatus.FERDIG_DOKUMENTERT || e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)
                    .toList();

            var underArbeidEtterlevelseList = aktivEtterlevelserForDok.stream()
                    .filter(e -> e.getStatus() == EtterlevelseStatus.UNDER_REDIGERING
                            || e.getStatus() == EtterlevelseStatus.IKKE_RELEVANT
                            || e.getStatus() == EtterlevelseStatus.FERDIG
                            || e.getStatus() == EtterlevelseStatus.OPPFYLLES_SENERE)
                    .toList();

            var antallKravIkkeStartet = totalKravForEdok - (oppfyltEtterlevelseList.size() + underArbeidEtterlevelseList.size());

            dokumentasjon.getEtterlevelseDokumentasjonData().getArdoqSystemIds().forEach(ardoqSystemId -> {
                ardoqExportFields.add(
                        ArdoqExportField.builder()
                                .ardoqId(ardoqSystemId)
                                .systemNavn(systemer.stream().filter(s -> s.getArdoqID().equals(ardoqSystemId)).findFirst().map(ArdoqSystemResponse::getNavn).orElse("Ukjent system"))
                                .etterlevelseDokumentNummer("E" + dokumentasjon.getEtterlevelseNummer())
                                .etterlevelseDokumentNavn(dokumentasjon.getTitle())
                                .antallKrav(totalKravForEdok)
                                .kravIkkeStartet(antallKravIkkeStartet)
                                .kravUnderArbeid(underArbeidEtterlevelseList.size())
                                .kravFerdig(oppfyltEtterlevelseList.size())
                                .linkTilEtterlevelsesDokument(frontendUrl + "/dokumentasjon/" + dokumentasjon.getId())
                                .build()
                );
            });
        });

        return ardoqExportFields;
    }
}

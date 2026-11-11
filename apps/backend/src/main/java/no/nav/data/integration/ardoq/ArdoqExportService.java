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
import no.nav.data.integration.ardoq.domain.ArdoqExportEtterlevelseDokumentField;
import no.nav.data.integration.ardoq.domain.ArdoqSystemRelationField;
import no.nav.data.integration.ardoq.domain.ArdoqTeamRelation;
import no.nav.data.integration.ardoq.dto.ArdoqPostPayload;
import no.nav.data.integration.ardoq.dto.ArdoqSystemResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqExportService {

    private static final int FETCH_BATCH_SIZE = 500;

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final KravService kravService;
    private final EtterlevelseService etterlevelseService;
    private final ArdoqClient ardoqClient;

    @Value("${etterlev.frontend.url}")
    private String frontendUrl;


    public List<ArdoqSystemRelationField> getArdoqSystemEtterlevelseDocRelationData() {
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = etterlevelseDokumentasjonService.getEtterlevelseDokumentasjonerWithSystem();
        List<ArdoqSystemRelationField> ardoqSystemRelationFields = new ArrayList<>();
        List<ArdoqSystemResponse> ardoqSystems = ardoqClient.getAllArdoqSystems();

        etterlevelseDokumentasjonMedSystem.forEach(dokumentasjon -> {
            dokumentasjon.getEtterlevelseDokumentasjonData().getArdoqSystemIds().forEach(ardoqSystemId -> {
                ardoqSystemRelationFields.add(
                        ArdoqSystemRelationField.builder()
                                .ardoqId(ardoqSystems.stream().filter(s -> s.getArdoqID().equals(ardoqSystemId)).findFirst().map(ArdoqSystemResponse::getArdoqUrlId).orElse(null))
                                .etterlevelseDokumentId(String.valueOf(dokumentasjon.getId()))
                                .build()
                );
            });
        });

        return ardoqSystemRelationFields;
    }

    public List<ArdoqExportEtterlevelseDokumentField> getEtterlevelseDocData() {
        List<Krav> aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = getAllEtterlevelseDokumentasjonerInBatches();
        List<ArdoqExportEtterlevelseDokumentField> ardoqExportEtterlevelseDokumentFields = new ArrayList<>();

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

            ardoqExportEtterlevelseDokumentFields.add(
                    ArdoqExportEtterlevelseDokumentField.builder()
                            .etterlevelseDokumentNummer("E" + dokumentasjon.getEtterlevelseNummer())
                            .etterlevelseDokumentId(String.valueOf(dokumentasjon.getId()))
                            .etterlevelseDokumentNavn(dokumentasjon.getTitle())
                            .antallKrav(String.valueOf(totalKravForEdok))
                            .kravIkkeStartet(String.valueOf(antallKravIkkeStartet))
                            .kravUnderArbeid(String.valueOf(underArbeidEtterlevelseList.size()))
                            .kravFerdig(String.valueOf(oppfyltEtterlevelseList.size()))
                            .linkTilEtterlevelsesDokument(frontendUrl + "/dokumentasjon/" + dokumentasjon.getId())
                            .teams(Optional.ofNullable(dokumentasjon.getEtterlevelseDokumentasjonData().getTeams()).orElseGet(List::of))
                            .build()
                );
        });

        return ardoqExportEtterlevelseDokumentFields;
    }

    private List<EtterlevelseDokumentasjon> getAllEtterlevelseDokumentasjonerInBatches() {
        List<EtterlevelseDokumentasjon> result = new ArrayList<>();
        int pageNumber = 0;

        Page<EtterlevelseDokumentasjon> page;
        do {
            page = etterlevelseDokumentasjonService.getAll(PageRequest.of(pageNumber++, FETCH_BATCH_SIZE));
            result.addAll(page.getContent());
        } while (page.hasNext());

        return result;
    }

    public void ardoqExportEtterlevelseDokumentDataToExcel(List<ArdoqExportEtterlevelseDokumentField> ardoqExportEtterlevelseDokumentFields) {
            // config id for referanse mellom Etterlevelse og system
            //ikke sensitiv data
            final String configIdEtterlevelse = "cd645f7f3589042edfc50ce0";
            final String configIdTeam = "1a2fd08cbcb9ddd8b0b815cf";

            List<ArdoqTeamRelation> ardoqTeamRelations = new ArrayList<>();
            for (ArdoqExportEtterlevelseDokumentField ardoqExportEtterlevelseDokumentField : ardoqExportEtterlevelseDokumentFields) {
                List<String> teams = ardoqExportEtterlevelseDokumentField.getTeams();
                if (teams != null) {
                    for (String teamId : teams) {
                        ardoqTeamRelations.add(ArdoqTeamRelation.builder()
                                .etterlevelseDokumentId(ardoqExportEtterlevelseDokumentField.getEtterlevelseDokumentId())
                                .teamId(teamId)
                                .build());

                    }
                }
            }

        ArdoqPostPayload<ArdoqExportEtterlevelseDokumentField> payload = ArdoqPostPayload.<ArdoqExportEtterlevelseDokumentField>builder()
                .config(
                        ArdoqPostPayload.ArdoqConfig.builder()
                                .id(configIdEtterlevelse)
                                .name("API Import component Etterlevelsesdokument.xlsx")
                                .build()
                ).tables(
                        List.of(
                                ArdoqPostPayload.ArdoqTable.<ArdoqExportEtterlevelseDokumentField>builder()
                                        .id("1")
                                        .rows(ardoqExportEtterlevelseDokumentFields)
                                        .build()
                        )
                ).build();

        ardoqClient.postArdoqData(payload);

        ArdoqPostPayload<ArdoqTeamRelation> teamPayload = ArdoqPostPayload.<ArdoqTeamRelation>builder()
                .config(
                        ArdoqPostPayload.ArdoqConfig.builder()
                                .id(configIdTeam)
                                .name("API Import relasjon etterlevelse mot team.xlsx")
                                .build()
                ).tables(
                        List.of(
                                ArdoqPostPayload.ArdoqTable.<ArdoqTeamRelation>builder()
                                        .id("1")
                                        .rows(ardoqTeamRelations)
                                        .build()
                        )
                ).build();

        ardoqClient.postArdoqData(teamPayload);


    }

    public void ardoqExportSystemRelationDataToExcel(List<ArdoqSystemRelationField> ardoqExportSystemRelationFields) {
        // config id for referanse mellom Etterlevelse og system
        //ikke sensitiv data
        final String configId = "6d60048160a5309117c13f4f";

        ArdoqPostPayload<ArdoqSystemRelationField> payload = ArdoqPostPayload.<ArdoqSystemRelationField>builder()
                .config(
                        ArdoqPostPayload.ArdoqConfig.builder()
                                .id(configId)
                                .name("API import referanse Etterlevelse mot system")
                                .build()
                    ).tables(
                            List.of(
                                    ArdoqPostPayload.ArdoqTable.<ArdoqSystemRelationField>builder()
                                            .id("1")
                                            .rows(ardoqExportSystemRelationFields)
                                            .build()
                            )
                    ).build();

        ardoqClient.postArdoqData(payload);

    }
}

package no.nav.data.integration.ardoq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.EtterlevelseDokumentasjonService;
import no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain.EtterlevelseDokumentasjon;
import no.nav.data.etterlevelse.krav.KravService;
import no.nav.data.etterlevelse.krav.domain.Krav;
import no.nav.data.etterlevelse.krav.domain.KravStatus;
import no.nav.data.etterlevelse.krav.domain.dto.KravFilter;
import no.nav.data.integration.ardoq.domain.ArdoqExportField;
import no.nav.data.integration.ardoq.dto.ArdoqSystemResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ArdoqExportService {

    private final EtterlevelseDokumentasjonService etterlevelseDokumentasjonService;
    private final ArdoqClient ardoqClient;
    private final KravService kravService;


    public List<ArdoqExportField> getColumnData() {
        List<Krav> aktivKrav = kravService.getByFilter(KravFilter.builder().status(List.of(KravStatus.AKTIV.name())).build());
        List<ArdoqSystemResponse> systemer = ardoqClient.getAllArdoqSystems();
        List<EtterlevelseDokumentasjon> etterlevelseDokumentasjonMedSystem = etterlevelseDokumentasjonService.getEtterlevelseDokumentasjonerWithSystem();
        List<ArdoqExportField> ardoqExportFields = new ArrayList<>();

        etterlevelseDokumentasjonMedSystem.forEach(dokumentasjon -> {
            dokumentasjon.getEtterlevelseDokumentasjonData().getArdoqSystemIds().forEach(ardoqSystemId -> {
                ardoqExportFields.add(
                        ArdoqExportField.builder()
                                .ardoqId(ardoqSystemId)
                                .systemNavn(systemer.stream().filter(s -> s.getArdoqID().equals(ardoqSystemId)).findFirst().map(ArdoqSystemResponse::getNavn).orElse("Ukjent system"))
                                .etterlevelseDokumentNummer("E" + dokumentasjon.getEtterlevelseNummer())
                                .etterlevelseDokumentNavn(dokumentasjon.getTitle())
                                .antallKrav(0)
                                .kravIkkeStartet(0)
                                .kravUnderArbeid(0)
                                .kravFerdig(0)
                                .linkTilEtterlevelsesDokument("https://etterlevelse.nais.adeo.no/etterlevelse-dokumentasjon/" + dokumentasjon.getId())
                                .build()
                );
            });
        });

        return ardoqExportFields;
    }
}

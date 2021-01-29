package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.security.SecurityUtils;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;
import no.nav.data.etterlevelse.varsel.domain.Varslingsadresse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Krav implements DomainObject, KravId {

    private UUID id;
    private ChangeStamp changeStamp;
    private Integer version;

    private Integer kravNummer;
    @Default
    private Integer kravVersjon = 1;
    private String navn;
    private String beskrivelse;
    private String hensikt;
    private String utdypendeBeskrivelse;
    private String versjonEndringer;
    private List<String> dokumentasjon;
    private List<String> implementasjoner;
    private List<String> begreper;
    private List<Varslingsadresse> varslingsadresser;
    private List<String> rettskilder;
    private List<String> tagger;
    private Periode periode;

    // Codelist AVDELING
    private String avdeling;
    // Codelist UNDERAVDELING
    private String underavdeling;

    // Codelist RELEVANS
    private List<String> relevansFor;
    private KravStatus status;

    public enum KravStatus {
        UNDER_REDIGERING,
        FERDIG
    }

    public Krav convert(KravRequest request) {
        navn = request.getNavn();
        beskrivelse = request.getBeskrivelse();
        hensikt = request.getHensikt();
        utdypendeBeskrivelse = request.getUtdypendeBeskrivelse();
        versjonEndringer = request.getVersjonEndringer();

        dokumentasjon = copyOf(request.getDokumentasjon());
        implementasjoner = copyOf(request.getImplementasjoner());
        begreper = copyOf(request.getBegreper());
        varslingsadresser = copyOf(request.getVarslingsadresser());
        rettskilder = copyOf(request.getRettskilder());
        tagger = copyOf(request.getTagger());

        avdeling = request.getAvdeling();
        underavdeling = request.getUnderavdeling();
        relevansFor = copyOf(request.getRelevansFor());
        status = request.getStatus();
        periode = request.getPeriode();

        return this;
    }

    public KravResponse toResponse() {
        var response = KravResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .hensikt(hensikt)
                .utdypendeBeskrivelse(utdypendeBeskrivelse)
                .versjonEndringer(versjonEndringer)
                .dokumentasjon(copyOf(dokumentasjon))
                .implementasjoner(copyOf(implementasjoner))
                .begreper(copyOf(begreper))
                .varslingsadresser(copyOf(varslingsadresser))
                .rettskilder(copyOf(rettskilder))
                .tagger(copyOf(tagger))
                .periode(periode)
                .avdeling(CodelistService.getCodelistResponse(ListName.AVDELING, avdeling))
                .underavdeling(CodelistService.getCodelistResponse(ListName.UNDERAVDELING, underavdeling))
                .relevansFor(CodelistService.getCodelistResponseList(ListName.RELEVANS, relevansFor))
                .status(status)
                .build();
        if (!SecurityUtils.isKravEier()) {
            response.getChangeStamp().setLastModifiedBy("Skjult");
            response.setVarslingsadresser(List.of());
        }
        return response;
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), navn);
    }
}

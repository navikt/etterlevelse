package no.nav.data.etterlevelse.krav.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import no.nav.data.common.storage.domain.ChangeStamp;
import no.nav.data.common.storage.domain.DomainObject;
import no.nav.data.etterlevelse.codelist.CodelistService;
import no.nav.data.etterlevelse.codelist.codeusage.dto.InstanceId;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.KravResponse;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Krav implements DomainObject {

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
    private List<String> dokumentasjon;
    private List<String> implementasjoner;
    private List<String> begreper;
    private List<String> kontaktPersoner;
    private List<String> rettskilder;
    private List<String> tagger;
    private Periode periode;

    private String avdeling;
    private String underavdeling;

    // Codelist RELEVANS
    private String relevansFor;
    private KravStatus status;

    public enum KravStatus {
        UNDER_REDIGERING,
        FERDIG;

    }

    public Krav convert(KravRequest request) {
        if (!request.isUpdate()) {
            setId(UUID.randomUUID());
        }
        navn = request.getNavn();
        beskrivelse = request.getBeskrivelse();
        hensikt = request.getHensikt();
        utdypendeBeskrivelse = request.getUtdypendeBeskrivelse();

        dokumentasjon = copyOf(request.getDokumentasjon());
        implementasjoner = copyOf(request.getImplementasjoner());
        begreper = copyOf(request.getBegreper());
        kontaktPersoner = copyOf(request.getKontaktPersoner());
        rettskilder = copyOf(request.getRettskilder());
        tagger = copyOf(request.getTagger());

        avdeling = request.getAvdeling();
        underavdeling = request.getUnderavdeling();
        relevansFor = request.getRelevansFor();
        status = request.getStatus();

        return this;
    }

    public KravResponse convertToResponse() {
        return KravResponse.builder()
                .id(id)
                .changeStamp(convertChangeStampResponse())
                .version(version)
                .kravNummer(kravNummer)
                .kravVersjon(kravVersjon)
                .navn(navn)
                .beskrivelse(beskrivelse)
                .hensikt(hensikt)
                .utdypendeBeskrivelse(utdypendeBeskrivelse)
                .dokumentasjon(copyOf(dokumentasjon))
                .implementasjoner(copyOf(implementasjoner))
                .begreper(copyOf(begreper))
                .kontaktPersoner(copyOf(kontaktPersoner))
                .rettskilder(copyOf(rettskilder))
                .tagger(copyOf(tagger))
                .periode(periode)
                .avdeling(avdeling)
                .underavdeling(underavdeling)
                .relevansFor(CodelistService.getCodelistResponse(ListName.RELEVANS, relevansFor))
                .status(status)
                .build();
    }

    public InstanceId convertToInstanceId() {
        return new InstanceId(id.toString(), navn);
    }
}

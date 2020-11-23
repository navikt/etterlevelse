package no.nav.data.etterlevelse.krav.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;
import no.nav.data.etterlevelse.common.domain.Periode;
import no.nav.data.etterlevelse.krav.domain.Krav.KravStatus;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class KravRequest implements RequestElement {

    private String id;

    private Integer kravNummer;
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

    @Schema(description = "Codelist RELEVANS")
    private String relevansFor;
    private KravStatus status;
    private boolean nyKravVersjon;

    private Boolean update;

    @Override
    public void format() {
        setId(trimToNull(id));
        setNavn(trimToNull(navn));
        setBeskrivelse(trimToNull(beskrivelse));
        setHensikt(trimToNull(hensikt));
        setUtdypendeBeskrivelse(trimToNull(utdypendeBeskrivelse));
        setAvdeling(trimToNull(avdeling));
        setUnderavdeling(trimToNull(underavdeling));

        setDokumentasjon(formatList(dokumentasjon));
        setImplementasjoner(formatList(implementasjoner));
        setBegreper(formatList(begreper));
        setKontaktPersoner(formatList(kontaktPersoner));
        setRettskilder(formatList(rettskilder));
        setTagger(formatList(tagger));

        if (status == null) {
            status = KravStatus.UNDER_REDIGERING;
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkId(this);
        validator.checkBlank(Fields.navn, navn);
        if (nyKravVersjon) {
            validator.checkNull(Fields.kravNummer, kravNummer);
        }
        validator.checkCodelist(Fields.relevansFor, relevansFor, ListName.RELEVANS);
    }
}

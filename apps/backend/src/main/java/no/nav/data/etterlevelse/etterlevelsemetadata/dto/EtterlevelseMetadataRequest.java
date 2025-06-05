package no.nav.data.etterlevelse.etterlevelsemetadata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.etterlevelsemetadata.domain.EtterlevelseMetadata;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.copyOf;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadataRequest implements RequestElement, KravId {

    private UUID id;
    private Integer kravVersjon;
    private Integer kravNummer;
    private UUID etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private Boolean update;
    private String notater;

    @Override
    public void format() {
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkNull(Fields.kravNummer, kravNummer);
        validator.checkNull(Fields.kravVersjon, kravVersjon);
    }

    // Updates all fields of the input with this request, except id and behandlingId
    public void mergeInto(EtterlevelseMetadata emd) {
        emd.setKravNummer(kravNummer);
        emd.setKravVersjon(kravVersjon);
        emd.setEtterlevelseDokumentasjon(etterlevelseDokumentasjonId);
        emd.setTildeltMed(copyOf(tildeltMed));
        emd.setNotater(notater);
    }

}

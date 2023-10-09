package no.nav.data.etterlevelse.etterlevelsemetadata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.common.domain.KravId;

import java.util.List;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseMetadataRequest implements RequestElement, KravId {

    private String id;
    private Integer kravVersjon;
    private Integer kravNummer;
    private String etterlevelseDokumentasjonId;
    private List<String> tildeltMed;
    private Boolean update;
    private String notater;

    @Override
    public void format() {
        setId(trimToNull(id));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(Fields.id,id);
        validator.checkId(this);
        validator.checkNull(Fields.kravNummer, kravNummer);
        validator.checkNull(Fields.kravVersjon, kravVersjon);
    }

}

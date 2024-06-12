package no.nav.data.etterlevelse.dokumentRelasjon.dto;

import io.micrometer.core.ipc.http.HttpSender;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.dokumentRelasjon.domain.RelationType;
import java.util.UUID;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class DokumentRelasjonRequest implements RequestElement {
    private String id;

    private RelationType relationType;

    private String from;

    private String to;

    private Boolean update;

    @Override
    public void format(){
        setId(trimToNull(id));
        setFrom(trimToNull(from));
        setTo(trimToNull(to));
    };

    @Override
    public void validateFieldValues(Validator<?>validator) {
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.from, from);
        validator.checkUUID(Fields.to, to);
    };
}

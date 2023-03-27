package no.nav.data.etterlevelse.virkemiddel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.krav.dto.KravRequest;
import no.nav.data.etterlevelse.krav.dto.RegelverkRequest;

import java.util.List;

import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class VirkemiddelRequest implements RequestElement {

    private String id;
    private String navn;
    @Schema(description = "Codelist VIRKEMIDDELTYPE")
    private String virkemiddelType;
    private List<RegelverkRequest> regelverk;
    private String livsSituasjon;
    private Boolean update;

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(KravRequest.Fields.id, id);
        validator.checkId(this);
        validator.checkBlank(KravRequest.Fields.navn, navn);
        validator.validateType(KravRequest.Fields.regelverk, regelverk);
    }

    @Override
    public void format() {
        setId(trimToNull(id));
        setNavn(trimToNull(navn));
    }
}

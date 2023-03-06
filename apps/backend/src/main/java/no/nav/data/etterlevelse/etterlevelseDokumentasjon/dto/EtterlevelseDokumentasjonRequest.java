package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.etterlevelse.codelist.domain.ListName;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatListToUppercase;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@FieldNameConstants
@NoArgsConstructor
@AllArgsConstructor
public class EtterlevelseDokumentasjonRequest implements RequestElement {
    private String id;
    private Boolean update;
    private Integer etterlevelseNummer;

    private String title;
    private String behandlingId;
    @Schema(description = "Codelist RELEVANS")
    private List<String> irrelevansFor;

    private List<String> teams;

    @Override
    public void format() {
        setId(trimToNull(id));
        setTitle(trimToNull(title));
        setIrrelevansFor(formatListToUppercase(irrelevansFor));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(EtterlevelseDokumentasjonRequest.Fields.id, id);
        validator.checkId(this);
        validator.checkCodelists(EtterlevelseDokumentasjonRequest.Fields.irrelevansFor, irrelevansFor, ListName.RELEVANS);
    }
}

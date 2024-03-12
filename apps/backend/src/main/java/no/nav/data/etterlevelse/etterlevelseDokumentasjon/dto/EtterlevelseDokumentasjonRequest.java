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

import static no.nav.data.common.utils.StringUtils.*;
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
    private List<String> behandlingIds;
    private boolean behandlerPersonopplysninger;
    private String virkemiddelId;
    private boolean knyttetTilVirkemiddel;
    @Schema(description = "Codelist RELEVANS")
    private List<String> irrelevansFor;
    private boolean knytteTilTeam;
    private List<String> teams;
    @Schema(description = "Codelist AVDELING")
    private String avdeling;
    @Override
    public void format() {
        setId(trimToNull(id));
        setTitle(trimToNull(title));
        setBehandlingIds(formatList(behandlingIds));
        setVirkemiddelId(trimToNull(virkemiddelId));
        setIrrelevansFor(formatListToUppercase(irrelevansFor));
        setTeams(formatList(teams));
        setAvdeling(toUpperCaseAndTrim(avdeling));
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkUUID(EtterlevelseDokumentasjonRequest.Fields.id, id);
        validator.checkId(this);
        validator.checkCodelists(EtterlevelseDokumentasjonRequest.Fields.irrelevansFor, irrelevansFor, ListName.RELEVANS);
        validator.checkCodelist(Fields.avdeling, avdeling, ListName.AVDELING);
    }
}

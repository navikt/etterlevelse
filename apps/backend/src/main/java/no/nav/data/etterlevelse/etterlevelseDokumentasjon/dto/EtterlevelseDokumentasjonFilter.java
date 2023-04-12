package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EtterlevelseDokumentasjonFilter {

    private String id;
    private List<String> relevans;
    private Integer sistRedigert;
    private Boolean mineEtterlevelseDokumentasjoner;
    private List<String> teams;

    private String behandlingId;
    private Boolean behandlerPersonopplysninger;
    private String virkemiddelId;
    private Boolean knyttetTilVirkemiddel;
    private String sok;


    public boolean isEmpty() {
        validate();
        return StringUtils.isBlank(id)
                && !isSok()
                && getRelevans().isEmpty()
                && getTeams().isEmpty()
                && sistRedigert == null
                && mineEtterlevelseDokumentasjoner == null
                && behandlingId == null
                && virkemiddelId == null
                && behandlerPersonopplysninger == null
                && knyttetTilVirkemiddel == null
                ;
    }

    private void validate() {
        if (sistRedigert != null) {
            if (sistRedigert < 1) {
                sistRedigert = null;
            } else if (sistRedigert > 20) {
                sistRedigert = 20;
            }
        }
        setRelevans(formatList(relevans));
        setTeams(formatList(teams));
        setSok(trimToNull(sok));
    }

    public boolean isGetMineEtterlevelseDokumentasjoner() {
        return Boolean.TRUE.equals(getMineEtterlevelseDokumentasjoner());
    }

    public boolean isSok() {
        return !StringUtils.isBlank(sok);
    }

    public boolean requiresLogin() {
        return isGetMineEtterlevelseDokumentasjoner() || sistRedigert != null;
    }
}

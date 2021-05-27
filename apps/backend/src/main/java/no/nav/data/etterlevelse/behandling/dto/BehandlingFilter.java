package no.nav.data.etterlevelse.behandling.dto;

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
public class BehandlingFilter {

    private String id;
    private List<String> relevans;
    private Integer sistRedigert;
    private Boolean mineBehandlinger;
    private List<String> teams;
    private String sok;

    public boolean isEmpty() {
        validate();
        return StringUtils.isBlank(id)
                && !isSok()
                && getRelevans().isEmpty()
                && getTeams().isEmpty()
                && sistRedigert == null
                && mineBehandlinger == null
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

    public boolean isGetMineBehandlinger() {
        return Boolean.TRUE.equals(getMineBehandlinger());
    }

    public boolean isSok() {
        return !StringUtils.isBlank(sok);
    }

    public boolean requiresLogin() {
        return isGetMineBehandlinger() || sistRedigert != null;
    }
}

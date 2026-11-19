package no.nav.data.integration.ardoq.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArdoqTeamRelation {

    @JsonProperty("etterlevelses_dokument_id")
    private String etterlevelseDokumentId;

    @JsonProperty("team_id")
    private String teamId;
}

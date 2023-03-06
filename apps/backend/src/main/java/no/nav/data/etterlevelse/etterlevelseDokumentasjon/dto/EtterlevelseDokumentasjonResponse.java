package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;
import no.nav.data.common.rest.ChangeStampResponse;
import no.nav.data.etterlevelse.codelist.dto.CodelistResponse;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseNummer", "title", "behandlingId"})
public class EtterlevelseDokumentasjonResponse {

    private UUID id;
    private ChangeStampResponse changeStamp;
    private Integer version;

    private Integer etterlevelseNummer;

    private String title;
    private String behandlingId;
    @Singular("relevansForSingle")
    private List<CodelistResponse> irrelevansFor;
    @Singular("team")
    private List<String> teams;
}

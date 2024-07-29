package no.nav.data.etterlevelse.etterlevelseDokumentasjon.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import no.nav.data.etterlevelse.etterlevelse.dto.EtterlevelseResponse;

import java.time.LocalDateTime;
import java.util.List;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "etterlevelseNummer", "title", "behandlingId"})
public class EtterlevelseDokumentasjonGraphQlResponse extends EtterlevelseDokumentasjonResponse {
    private List<EtterlevelseResponse> etterlevelser;
    private LocalDateTime sistEndretEtterlevelse;
    private LocalDateTime sistEndretDokumentasjon;
    private EtterlevelseDokumentasjonStats stats;
}

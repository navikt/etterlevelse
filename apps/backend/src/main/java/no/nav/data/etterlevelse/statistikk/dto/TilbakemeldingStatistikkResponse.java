package no.nav.data.etterlevelse.statistikk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TilbakemeldingStatistikkResponse {
    private String id;
    private String kravTittel;
    private Integer kravNummer;
    private Integer kravVersjon;
    private Timestamp mottattTid;
    private Timestamp besvartTid;
    private Boolean fortTilKravEndring;
    private String status;
}

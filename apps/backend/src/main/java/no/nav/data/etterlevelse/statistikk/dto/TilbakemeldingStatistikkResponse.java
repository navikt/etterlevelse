package no.nav.data.etterlevelse.statistikk.dto;

import java.time.Duration;
import java.time.LocalDateTime;

public class TilbakemeldingStatistikkResponse {
    private String id;
    private String kravTittel;
    private Integer kravNummer;
    private Integer kravVersjon;
    private LocalDateTime mottatt;
    private LocalDateTime besvart;
    private Boolean fortTilKravEndring;
    private String status;

    private Duration duration;
}

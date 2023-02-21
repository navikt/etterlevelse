package no.nav.data.etterlevelse.krav.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum TilbakemeldingStatus {
    @JsonProperty("UBESVART")
    UBESVART,
    @JsonProperty("BESVART")
    BESVART,
    @JsonProperty("MIDLERTIDLIG_SVAR")
    MIDLERTIDLIG_SVAR,
}

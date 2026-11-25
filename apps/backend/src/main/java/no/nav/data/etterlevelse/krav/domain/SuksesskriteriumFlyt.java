package no.nav.data.etterlevelse.krav.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum SuksesskriteriumFlyt {
    @JsonProperty("UNDEFINED")
    UNDEFINED,
    @JsonProperty("INGEN_KONSEKVENS")
    INGEN_KONSEKVENS,
    @JsonProperty("GA_OVER_NOEN_SUKSESSKRITERIER")
    GA_OVER_NOEN_SUKSESSKRITERIER,
    @JsonProperty("GA_OVER_RESTERENDE_SUKSESSKRITERIER")
    GA_OVER_RESTERENDE_SUKSESSKRITERIER,
}

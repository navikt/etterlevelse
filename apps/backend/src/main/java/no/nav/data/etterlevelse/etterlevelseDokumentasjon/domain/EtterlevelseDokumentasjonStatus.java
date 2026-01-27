package no.nav.data.etterlevelse.etterlevelseDokumentasjon.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum EtterlevelseDokumentasjonStatus {
    @JsonProperty("UNDER_ARBEID")
    UNDER_ARBEID,
    @JsonProperty("SENDT_TIL_GODKJENNING_TIL_RISIKOEIER")
    SENDT_TIL_GODKJENNING_TIL_RISIKOEIER,
    @JsonProperty("GODKJENT_AV_RISIKOEIER")
    GODKJENT_AV_RISIKOEIER;

}

package no.nav.data.common.auditing.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum SearchTypes {
    @JsonProperty("KRAV")
    KRAV,
    @JsonProperty("ETTERLEVELSE_DOKUMENTASJON")
    ETTERLEVELSE_DOKUMENTASJON,
    @JsonProperty("Krav")
    Krav,
    @JsonProperty("EtterlevelseDokumentasjon")
    EtterlevelseDokumentasjon,
}

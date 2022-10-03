package no.nav.data.etterlevelse.arkivering.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum EtterlevelseArkivStatus {
        @JsonProperty("TIL_ARKIVERING")
        TIL_ARKIVERING,
        @JsonProperty("BEHANDLER_ARKIVERING")
        BEHANDLER_ARKIVERING,
        @JsonProperty("ARKIVERT")
        ARKIVERT,
        @JsonProperty("IKKE_ARKIVER")
        IKKE_ARKIVER,
        @JsonProperty("ERROR")
        ERROR
}

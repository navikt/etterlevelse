package no.nav.data.etterlevelse.krav.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public enum KravStatus {
    @JsonProperty("AKTIV")
    AKTIV,
    @JsonProperty("UNDER_ARBEID")
    UNDER_ARBEID,
    @JsonProperty("UTGAATT")
    UTGAATT,
    @JsonProperty("UTKAST")
    UTKAST;

    public boolean supersedes(KravStatus other) {
        return this.ordinal() < other.ordinal();
    }

    public boolean kanEtterleves() {
        return gjeldende().contains(this);
    }

    public boolean erUtkast() {
        return this == UTKAST;
    }

    public static List<KravStatus> gjeldende() {
        return List.of(AKTIV, UNDER_ARBEID);
    }
}

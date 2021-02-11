package no.nav.data.etterlevelse.krav.domain;

public enum KravStatus {
    AKTIV,
    UNDER_ARBEID,
    UTGAATT,
    UTKAST;

    public boolean supersedes(KravStatus other) {
        return this.ordinal() < other.ordinal();
    }

    public boolean kanEtterleves() {
        return this == AKTIV || this == UNDER_ARBEID;
    }
}

package no.nav.data.etterlevelse.krav.domain;

import java.util.List;

public enum KravStatus {
    AKTIV,
    UTGAATT,
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
        return List.of(AKTIV);
    }
}

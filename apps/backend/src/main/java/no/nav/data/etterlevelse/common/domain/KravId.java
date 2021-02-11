package no.nav.data.etterlevelse.common.domain;

public interface KravId {

    Integer getKravNummer();

    Integer getKravVersjon();

    default String kravId() {
        return "K%d.%d".formatted(getKravNummer(), getKravVersjon());
    }

    default boolean succeeds(KravId kid) {
        return kid.getKravNummer().equals(getKravNummer()) && kid.getKravVersjon() < getKravVersjon();
    }
}

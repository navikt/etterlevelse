package no.nav.data.etterlevelse.krav.domain.dto;

import no.nav.data.etterlevelse.common.domain.KravId;
import no.nav.data.etterlevelse.krav.domain.KravStatus;

public interface KravIdStatus extends KravId {

    KravStatus getStatus();

    default boolean supersedes(KravIdStatus other) {
        return other.getKravNummer().equals(getKravNummer()) && (
                getStatus().supersedes(other.getStatus())
                        || (!other.getStatus().supersedes(getStatus()) && other.getKravVersjon() < getKravVersjon())
        );
    }
}

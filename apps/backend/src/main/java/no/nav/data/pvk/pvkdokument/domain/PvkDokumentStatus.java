package no.nav.data.pvk.pvkdokument.domain;

public enum PvkDokumentStatus {
    UNDERARBEID,
    SENDT_TIL_PVO,
    PVO_UNDERARBEID,
    VURDERT_AV_PVO,
    VURDERT_AV_PVO_TRENGER_MER_ARBEID,
    SENDT_TIL_PVO_FOR_REVURDERING,
    TRENGER_GODKJENNING,
    GODKJENT_AV_RISIKOEIER,
    AKTIV,
}

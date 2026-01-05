package no.nav.data.pvk.pvkdokument.domain;

public enum PvkVurdering {
    SKAL_IKKE_UTFORE,
    SKAL_UTFORE,
    ALLEREDE_UTFORT,

    //Brukes for å nullstille feltet på frontend
    UNDEFINED
}

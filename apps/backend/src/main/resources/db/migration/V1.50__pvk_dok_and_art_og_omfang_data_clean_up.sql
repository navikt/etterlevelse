UPDATE PVK_DOKUMENT
set data = data - 'stemmerPersonkategorier'
    - 'personkategoriAntallBeskrivelse'
    - 'tilgangsBeskrivelsePersonopplysningene'
    - 'lagringsBeskrivelsePersonopplysningene';


UPDATE BEHANDLINGENS_ART_OG_OMFANG
set data = data - 'antallInnsendingTilPvo'
    - 'ytterligereEgenskaper'
    - 'skalUtforePvk'
    - 'pvkVurderingsBegrunnelse'
    - 'harInvolvertRepresentant'
    - 'representantInvolveringsBeskrivelse'
    - 'harDatabehandlerRepresentantInvolvering'
    - 'dataBehandlerRepresentantInvolveringBeskrivelse'
    - 'merknadTilRisikoeier'
    - 'merknadFraRisikoeier'
    - 'meldingerTilPvo'
    - 'godkjentAvRisikoeierDato'
    - 'godkjentAvRisikoeier';
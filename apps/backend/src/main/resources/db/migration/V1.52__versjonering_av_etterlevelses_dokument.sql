UPDATE etterlevelse_dokumentasjon
SET DATA = jsonb_set(DATA, '{etterlevelseDokumentVersjon}', '1', true);
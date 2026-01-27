UPDATE etterlevelse_dokumentasjon
SET DATA = jsonb_set(DATA, '{versjonHistorikk}',
                     '[{"versjon": 1, "godkjentAvRisikoeier": "", "godkjentAvRiskoierDato": null, "nyVersjonOpprettetDato": null}]'::jsonb,
                     true);
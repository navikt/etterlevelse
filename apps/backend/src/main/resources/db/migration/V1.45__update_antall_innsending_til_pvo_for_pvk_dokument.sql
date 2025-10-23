UPDATE pvk_dokument
SET data = jsonb_set(data, '{antallInnsendingTilPvo}', '1'::jsonb, true) where status != 'UNDERARBEID';
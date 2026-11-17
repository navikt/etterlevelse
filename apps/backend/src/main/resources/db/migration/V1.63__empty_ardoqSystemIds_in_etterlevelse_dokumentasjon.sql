UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = jsonb_set(data, '{ardoqSystemIds}', '[]'::jsonb, true);

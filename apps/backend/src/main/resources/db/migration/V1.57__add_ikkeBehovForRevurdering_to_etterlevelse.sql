UPDATE etterlevelse
SET data = jsonb_set(data, '{ikkeBehovForRevurdering}', 'false'::jsonb, true);
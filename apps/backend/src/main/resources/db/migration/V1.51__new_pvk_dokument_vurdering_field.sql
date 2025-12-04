UPDATE PVK_DOKUMENT
SET DATA = jsonb_set(DATA, '{pvkVurdering}', '"SKAL_IKKE_UTFORE"', true)
WHERE data ->>'skalUtforePvk' = 'false';

UPDATE PVK_DOKUMENT
SET DATA = jsonb_set(DATA, '{pvkVurdering}', '"SKAL_UTFORE"', true)
WHERE data ->>'skalUtforePvk' = 'true';

UPDATE PVK_DOKUMENT
SET DATA = jsonb_set(DATA, '{pvkVurdering}', '"UNDEFINED"', true)
WHERE data ->>'skalUtforePvk' is null;
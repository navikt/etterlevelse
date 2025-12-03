update pvk_dokument
set data = jsonb_set(data, '{skalUtforePvk}', '"SKAL_UTFORE_PVK"', false)
where data ->>'skalUtforePvk' = 'true';

update pvk_dokument
set data = jsonb_set(data, '{skalUtforePvk}', '"SKAL_IKKE_UTFORE"', false)
where data ->>'skalUtforePvk' = 'false';

update pvk_dokument
set data = jsonb_set(data, '{skalUtforePvk}', '"UNDEFINED"', false)
where data ->>'skalUtforePvk' is null;
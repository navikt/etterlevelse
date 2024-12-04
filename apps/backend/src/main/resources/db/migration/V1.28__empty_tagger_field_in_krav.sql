UPDATE GENERIC_STORAGE
SET data = jsonb_set(data, '{tagger}', '[]', true )
WHERE TYPE = 'Krav';
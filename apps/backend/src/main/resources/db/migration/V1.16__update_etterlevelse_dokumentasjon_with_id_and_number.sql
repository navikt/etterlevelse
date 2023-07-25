UPDATE GENERIC_STORAGE
SET data = jsonb_set(data, '{id}', to_jsonb(temp_table.id), true )
    FROM (select id as id from GENERIC_STORAGE where type='EtterlevelseDokumentasjon') temp_table
WHERE TYPE = 'EtterlevelseDokumentasjon' and GENERIC_STORAGE.id = temp_table.id;


UPDATE GENERIC_STORAGE
SET data = jsonb_set(data, '{etterlevelseNummer}', to_jsonb(nextval('etterlevelse_nummer')), true )
WHERE TYPE = 'EtterlevelseDokumentasjon';
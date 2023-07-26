UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(GENERIC_STORAGE.data, '{etterlevelseDokumentasjonId}', temp_table.new_id::jsonb, true)
    FROM (
      SELECT to_jsonb(id) as new_id, * FROM GENERIC_STORAGE where type = 'EtterlevelseDokumentasjon'
    ) temp_table

WHERE temp_table.data->'behandlingIds' ?| array[GENERIC_STORAGE.data->>'behandlingId'] and GENERIC_STORAGE.type = 'EtterlevelseMetadata';

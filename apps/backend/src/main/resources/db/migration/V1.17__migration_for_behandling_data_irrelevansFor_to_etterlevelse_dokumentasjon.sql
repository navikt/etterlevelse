UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(GENERIC_STORAGE.data, '{irrelevansFor}', temp_table.new_data::jsonb, false)
    FROM (
      SELECT to_jsonb(data->'irrelevansFor') as new_data, * FROM GENERIC_STORAGE where type = 'BehandlingData'
    ) temp_table

WHERE GENERIC_STORAGE.data->'behandlingIds' ?| array[temp_table.data->>'behandlingId'] and GENERIC_STORAGE.type = 'EtterlevelseDokumentasjon';
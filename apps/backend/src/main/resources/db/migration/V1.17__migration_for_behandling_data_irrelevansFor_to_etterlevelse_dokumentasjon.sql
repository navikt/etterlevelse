UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(DATA, '{irrelevansFor}', to_jsonb(temp_table.new_data), false)
    FROM (
      SELECT to_jsonb(data->'irrelevansFor') as new_data, data as temp_data FROM GENERIC_STORAGE where type = 'BehandlingData'
    ) temp_table

WHERE GENERIC_STORAGE.data->'behandlingIds' ?| array[temp_table.temp_data->>'behandlingId'] and type = 'EtterlevelseDokumentasjon';

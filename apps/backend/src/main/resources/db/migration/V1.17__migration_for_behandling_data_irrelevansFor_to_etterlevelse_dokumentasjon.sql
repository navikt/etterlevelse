UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(DATA, '{irrelevansFor}', to_jsonb(temp_table.new_id), false)
    FROM (
      SELECT to_jsonb(data->'irrelevansFor') as new_id, data as new_data FROM GENERIC_STORAGE where
  data->'irrelevansFor' != '[]' and data->'irrelevansFor' != 'null' and
  type = 'BehandlingData'
    ) temp_table
WHERE data->'behandlingIds' ?| array[temp_table.new_data->>'behandlingId']  and type = 'EtterlevelseDokumentasjon';

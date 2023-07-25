UPDATE GENERIC_STORAGE
SET data = jsonb_set(data, '{irrelevansFor}', to_jsonb(temp_table.new_data), false )
    FROM (
        SELECT to_jsonb(data->'irrelevansFor') as new_data, data as temp_data FROM GENERIC_STORAGE
        where
        data->'irrelevansFor' != '[]' and data->'irrelevansFor' != 'null'
        AND
        type = 'BehandlingData'
    ) temp_table
WHERE data->'behandlingIds' ?| array[temp_table.temp_data ->> 'behandlingId'] and TYPE = 'EtterlevelseDokumentasjon';
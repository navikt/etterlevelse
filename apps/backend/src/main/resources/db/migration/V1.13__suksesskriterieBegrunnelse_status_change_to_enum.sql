UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(DATA, '{suksesskriterieBegrunnelser}', s.new_data::jsonb, false)
    FROM (
        SELECT
            ID,
            json_agg((status_update - 'underArbeid' - 'oppfylt' - 'ikkeRelevant')) as new_data
            FROM GENERIC_STORAGE,
                jsonb_array_elements( GENERIC_STORAGE.DATA -> 'suksesskriterieBegrunnelser') as elements,
                jsonb_set(elements, '{suksesskriterieStatus}',
                    CASE
                        WHEN elements ->> 'underArbeid' = 'true' THEN '"UNDER_ARBEID"'::jsonb
                        WHEN elements ->> 'oppfylt' = 'true' THEN '"OPPFYLT"'::jsonb
                        WHEN elements ->> 'ikkeRelevant' = 'true' THEN '"IKKE_RELEVANT"'::jsonb
                        ELSE '"UNDER_ARBEID"'::jsonb
                    END
                ) as status_update WHERE TYPE = 'Etterlevelse'
        GROUP BY ID
    ) s

WHERE s.ID = GENERIC_STORAGE.ID and TYPE = 'Etterlevelse';
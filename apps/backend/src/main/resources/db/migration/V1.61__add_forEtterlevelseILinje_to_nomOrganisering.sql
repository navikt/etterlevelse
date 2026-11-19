UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = jsonb_set(
        data,
        '{nomOrganisering,forEtterlevelseILinje}',
        CASE
            WHEN jsonb_array_length(NULLIF(data -> 'nomOrganisering' -> 'linjer', 'null'::jsonb)) > 0 THEN 'true'::jsonb
            WHEN jsonb_array_length(NULLIF(data -> 'nomOrganisering' -> 'seksjoner', 'null'::jsonb)) > 0 THEN 'false'::jsonb
            ELSE 'null'::jsonb
        END,
        true
    );

UPDATE krav
SET data = jsonb_set(data, '{suksesskriterier}', (
    SELECT jsonb_agg(
        suksesskriterie || jsonb_build_object(
            'oppfyltStatusFlyt', 'INGEN_KONSEKVENS',
            'ikkeOppfyltStatusFlyt', 'INGEN_KONSEKVENS',
            'ikkeRelevantStatusFlyt', 'INGEN_KONSEKVENS'
        ) ORDER BY position
    )
    FROM jsonb_array_elements(data -> 'suksesskriterier')
        WITH ORDINALITY AS kriterier(suksesskriterie, position)
))
WHERE data ->> 'status' = 'AKTIV';

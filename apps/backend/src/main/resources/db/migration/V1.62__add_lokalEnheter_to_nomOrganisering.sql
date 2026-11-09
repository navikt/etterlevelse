UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = jsonb_set(
        data,
        '{nomOrganisering,lokalEnheter}',
        '[]'::jsonb,
        true
    );

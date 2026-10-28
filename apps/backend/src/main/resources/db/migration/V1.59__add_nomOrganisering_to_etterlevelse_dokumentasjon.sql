UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = jsonb_set(
        data,
        '{nomOrganisering}',
        jsonb_build_object(
            'nomAvdelingId', COALESCE(data -> 'nomAvdelingId', '""'::jsonb),
            'avdelingNavn', COALESCE(data -> 'avdelingNavn', '""'::jsonb),
            'seksjoner', COALESCE(data -> 'seksjoner', '[]'::jsonb),
            'enheter', COALESCE(data -> 'enheter', '[]'::jsonb),
            'linjer', '[]'::jsonb,
            'linjeEnheter', '[]'::jsonb,
            'linjeFylker', '[]'::jsonb,
            'fylkeKontorer', '[]'::jsonb
        ),
        true
    );

UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = data - 'nomAvdelingId' - 'avdelingNavn' - 'seksjoner' - 'enheter';





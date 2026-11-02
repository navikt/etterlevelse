-- V1.59 used COALESCE(data -> 'key', ...), which only replaces SQL NULL (missing key).
-- Rows where a key existed as JSON null (e.g. "seksjoner": null) kept a jsonb null and
-- deserialize to a Java null, breaking the non-null GraphQL list fields.
-- NULLIF(..., 'null'::jsonb) also catches those jsonb nulls.
UPDATE ETTERLEVELSE_DOKUMENTASJON
SET data = jsonb_set(
        data,
        '{nomOrganisering}',
        jsonb_build_object(
            'nomAvdelingId', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'nomAvdelingId', 'null'::jsonb), '""'::jsonb),
            'avdelingNavn', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'avdelingNavn', 'null'::jsonb), '""'::jsonb),
            'seksjoner', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'seksjoner', 'null'::jsonb), '[]'::jsonb),
            'enheter', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'enheter', 'null'::jsonb), '[]'::jsonb),
            'linjer', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'linjer', 'null'::jsonb), '[]'::jsonb),
            'linjeEnheter', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'linjeEnheter', 'null'::jsonb), '[]'::jsonb),
            'linjeFylker', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'linjeFylker', 'null'::jsonb), '[]'::jsonb),
            'fylkeKontorer', COALESCE(NULLIF(data -> 'nomOrganisering' -> 'fylkeKontorer', 'null'::jsonb), '[]'::jsonb)
        ),
        true
    );


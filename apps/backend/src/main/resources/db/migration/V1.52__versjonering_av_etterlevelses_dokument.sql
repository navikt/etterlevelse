UPDATE etterlevelse_dokumentasjon
SET DATA = jsonb_set(DATA, '{etterlevelseDokumentVersjon}', '1', true);


-- OPPDATERE PVK dokument med etterlevelse dokument versjon lik 1 på hver eksisterende melding til pvo --
UPDATE PVK_DOKUMENT
SET DATA = jsonb_set(DATA, '{meldingerTilPvo}', s.new_meldingerTilPvo::jsonb, false) FROM (
SELECT
    id,
  json_agg((version_data)) as new_meldingerTilPvo
FROM PVK_DOKUMENT,
    jsonb_array_elements(PVK_DOKUMENT.data -> 'meldingerTilPvo') as elements,
    jsonb_set(elements, '{etterlevelseDokumentVersjon}', '1', true) as version_data GROUP BY id
) s
WHERE s.id = PVK_DOKUMENT.id;


-- OPPDATERE PVO tilbakemlding med etterlevelse dokument versjon lik 1 på hver eksisterende vurdering --

UPDATE pvo_tilbakemelding
SET DATA = jsonb_set(DATA, '{vurderinger}', t.new_vurderinger::jsonb, false) FROM (
SELECT
    id,
  json_agg((version_data)) as new_vurderinger
FROM pvo_tilbakemelding,
    jsonb_array_elements(pvo_tilbakemelding.data -> 'vurderinger') as elements,
    jsonb_set(elements, '{etterlevelseDokumentVersjon}', '1', true) as version_data GROUP BY id
) t
WHERE t.id = pvo_tilbakemelding.id;
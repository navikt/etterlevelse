UPDATE PVO_TILBAKEMELDING SET data = jsonb_set(
    data,
    '{innsendingId}',
    '1'::jsonb,
    true
);
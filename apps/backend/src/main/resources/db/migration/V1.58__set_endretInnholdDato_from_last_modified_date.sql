UPDATE etterlevelse
SET data = jsonb_set(
    data,
    '{endretInnholdDato}',
    to_jsonb(to_char(last_modified_date, 'YYYY-MM-DD"T"HH24:MI:SS.US')),
    true
);


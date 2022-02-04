UPDATE GENERIC_STORAGE
SET DATA = jsonb_set(DATA, '{status}', '"UTKAST"', false ) WHERE TYPE = 'Etterlevelse' AND DATA ->> 'status' = 'UNDER_ARBEID'
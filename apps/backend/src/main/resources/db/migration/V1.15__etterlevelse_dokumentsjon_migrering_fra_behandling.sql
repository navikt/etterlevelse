INSERT INTO GENERIC_STORAGE(ID, TYPE, CREATED_BY, CREATED_DATE, LAST_MODIFIED_BY, LAST_MODIFIED_DATE, VERSION, DATA)
  SELECT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring) ,
  'EtterlevelseDokumentasjon',
  'MIGRATION(ADMIN)',
   now() ,
  'MIGRATION(ADMIN)',
   now() ,
   0 ,
   new_data from (
  SELECT DISTINCT DATA ->> 'behandlingId' AS behandlingId,
  jsonb_build_object('behandlingIds', ARRAY[DATA -> 'behandlingId'], 'title', '', 'irrelevansFor', array[]::VARCHAR[]) AS new_data
  FROM GENERIC_STORAGE
  WHERE TYPE='Etterlevelse'
  ) temp_table ;
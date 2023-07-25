INSERT INTO GENERIC_STORAGE(TYPE, DATA)
  SELECT 'EtterlevelseDokumentasjon' , new_data from (
  SELECT DISTINCT DATA ->> 'behandlingId' AS behandlingId,
  jsonb_build_object('behandlingIds', ARRAY[DATA -> 'behandlingId'], 'title', '', 'irrelevansFor', array[]::VARCHAR[]) AS new_data
  FROM GENERIC_STORAGE
  WHERE TYPE='Etterlevelse'
  ) temp_table ;
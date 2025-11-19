UPDATE PVK_DOKUMENT
set data = jsonb_set(data, '{meldingerTilPvo}',
                       jsonb_build_array(
                               json_build_object('innsendingId', 1,
                                                 'merknadTilPvo', data->>'merknadTilPvoEllerRisikoeier',
                                                 'sendtTilPvoDato', data->>'sendtTilPvoDato',
                                                 'sendtTilPvoAv', data->>'sendtTilPvoAv')
                       )::jsonb, true) - 'merknadTilPvoEllerRisikoeier' - 'sendtTilPvoDato' - 'sendtTilPvoAv';
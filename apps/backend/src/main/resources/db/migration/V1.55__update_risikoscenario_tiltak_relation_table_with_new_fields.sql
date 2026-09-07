alter table risikoscenario_tiltak_relation
DROP CONSTRAINT risikoscenario_tiltak_relation_risikoscenario_id_tiltak_id_key
ADD COLUMN gyldig_dato_fra timestamp not null default '1999-01-01 00:00:00'
ADD COLUMN gyldig_dato_til timestamp not null default '9999-12-31 23:59:59';
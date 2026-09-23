alter table risikoscenario_tiltak_relation
    add column gyldig_dato_fra timestamp not null default '-infinity',
    add column gyldig_dato_til timestamp not null default 'infinity',
    drop constraint if exists risikoscenario_tiltak_relation_risikoscenario_id_tiltak_id_key,
    drop constraint if exists risikoscenario_tiltak_relation_risikoscenario_id_fkey,
    drop constraint if exists risikoscenario_tiltak_relation_tiltak_id_fkey;

alter table risikoscenario_tiltak_relation
    alter column risikoscenario_id set not null,
alter column tiltak_id set not null,
    add constraint chk_gyldig_periode check (gyldig_dato_fra < gyldig_dato_til);
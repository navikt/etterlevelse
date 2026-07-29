-- Denne migrasjonen trekker kravImage ut til egen tabell

-- Lag ny tabell...
create table if not exists krav_image
(
    id                 uuid primary key,
    krav_id            uuid not null,
    data               jsonb     not null,
    version            integer   not null
)
;

-- Populer tabellen...

insert into krav_image
select
    id,
    CAST (data ->> 'kravId' AS UUID),
    data - 'kravId',
    version
from generic_storage
where type = 'KravImage'
;

-- Legg på index på kravId...
create index if not exists idx_krav_image_krav_id on krav_image(krav_id)
;

-- Fjern foreldreløse krav_image...
delete from krav_image ki
where not exists (select 1 from krav k where ki.id = k.id)
;

-- Legg på fremmednøkkel...
alter table krav_image
drop constraint if exists fk_krav_image_krav_id;

alter table krav_image
    add constraint fk_krav_image_krav_id
        foreign key (krav_id)
            references krav (id)
            on delete cascade
;

-- Slett rader i den gamle tabellen...
delete from generic_storage where type = 'KravImage'
;
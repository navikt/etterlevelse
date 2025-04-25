-- Denne migrasjonen trekker krav ut til egen tabell

-- Lag ny tabell...
create table if not exists krav
(
    id                 uuid primary key,
    krav_nummer        integer   not null,
    krav_versjon       integer   not null,
    data               jsonb     not null,
    version            integer   not null,
    created_by         text      not null,
    created_date       timestamp not null,
    last_modified_by   text      not null,
    last_modified_date timestamp not null
)
;

-- Populer tabellen...
insert into krav 
    select
        id,
        CAST (data ->> 'kravNummer' AS integer), 
        CAST (data ->> 'kravVersjon' AS integer), 
        data - 'kravNummer' - 'kravVersjon', 
        version,
        created_by,
        created_date,
        last_modified_by,
        last_modified_date
    from generic_storage
    where type = 'Krav'
;

-- Legg på index på kravId...
create index idx_krav_krav_nummer_versjon on krav(krav_nummer, krav_versjon)
;

-- Legg til unique på kravId...
alter table krav
add constraint uq_krav_krav_nummer_versjon
unique (krav_nummer, krav_versjon)
;

-- Slett rader i den gamle tabellen...
delete from generic_storage where type = 'Krav'
;

-- Denne migrasjonen trekker tilbakemelding ut til egen tabell

-- Lag ny tabell...
create table if not exists tilbakemelding
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
insert into tilbakemelding 
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
    where type = 'Tilbakemelding'
;

-- Legg på index på kravId...
create index idx_tilbakemelding_krav_nummer_versjon on tilbakemelding(krav_nummer, krav_versjon)
;

-- Fjern foreldreløse tilbakemeldinger...
delete from tilbakemelding tilb
where not exists (select 1 from krav k where tilb.krav_nummer = k.krav_nummer and tilb.krav_versjon = k.krav_versjon)
;

-- Legg på fremmednøkkel
alter table tilbakemelding
add constraint fk_tilbakemelding_krav_krav_id
foreign key (krav_nummer, krav_versjon)
references krav (krav_nummer, krav_versjon)
;

-- Slett rader i den gamle tabellen...
delete from generic_storage where type = 'Tilbakemelding'
;

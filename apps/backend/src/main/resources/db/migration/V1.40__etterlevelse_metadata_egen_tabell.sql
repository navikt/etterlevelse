-- Denne migrasjonen trekker etterlevelse metadata ut til egen tabell
-- Fjerner behandlingId i samme slengen

-- Lag ny tabell...
create table if not exists etterlevelse_metadata
(
    id                 uuid primary key,
    krav_nummer        integer   not null,
    krav_versjon       integer   not null,
    etterlevelse_dokumentasjon      uuid not null,
    data               jsonb     not null,
    version            integer   not null,
    created_by         text      not null,
    created_date       timestamp not null,
    last_modified_by   text      not null,
    last_modified_date timestamp not null
)
;

-- Populer tabellen...

insert into etterlevelse_metadata
select
    id,
    CAST (data ->> 'kravNummer' AS integer),
    CAST (data ->> 'kravVersjon' AS integer),
    CAST (data ->> 'etterlevelseDokumentasjonId' AS uuid),
    data - 'kravNummer' - 'kravVersjon' - 'etterlevelseDokumentasjonId' - 'behandlingId',
    version,
    created_by,
    created_date,
    last_modified_by,
    last_modified_date
from generic_storage
where type = 'EtterlevelseMetadata'
;

-- Legg på index på kravId og etterlevelse_dokumentasjon_id...
create index if not exists idx_metadata_krav_nummer_versjon on etterlevelse_metadata(krav_nummer, krav_versjon)
;

create index if not exists idx_metadata_etterlevelse_dokumentasjon on etterlevelse_metadata(etterlevelse_dokumentasjon)
;

-- Fjern foreldreløse etterlevelse_metadata...
delete from etterlevelse_metadata etmet
where not exists (select 1 from krav k where etmet.krav_nummer = k.krav_nummer and etmet.krav_versjon = k.krav_versjon)
   or not exists (select 1 from etterlevelse_dokumentasjon ed where etmet.etterlevelse_dokumentasjon = ed.id)
;

-- Legg på fremmednøkkler...
alter table etterlevelse_metadata
    add constraint fk_metadata_krav_krav_id
        foreign key (krav_nummer, krav_versjon)
            references krav (krav_nummer, krav_versjon)
;

alter table etterlevelse_metadata
    add constraint fk_metadata_etterlevelse_dokumentasjon_id
        foreign key (etterlevelse_dokumentasjon)
            references etterlevelse_dokumentasjon (id)
;

-- Slett rader i den gamle tabellen...
delete from generic_storage where type = 'EtterlevelseMetadata'
;
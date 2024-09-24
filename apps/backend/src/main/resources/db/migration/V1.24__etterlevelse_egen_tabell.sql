-- Denne migrasjonen trekker etterlevelse ut til egen tabell

-- Lag ny tabell...

create table if not exists etterlevelse
(
    id                 uuid primary key,
    behandling_id
    text,
    etterlevelse_dokumentasjon_id
    text
    not
    null,
    krav_nummer        integer   not null,
    krav_versjon       integer   not null,
    data               jsonb     not null,
    version
    integer
    not
    null,
    created_by         text      not null,
    created_date       timestamp not null,
    last_modified_by   text      not null,
    last_modified_date
    timestamp
    not
    null
);

-- Opprett indekser for felt som søkes på...

create index idx_etterlevelse_dokumentasjon_id on etterlevelse (etterlevelse_dokumentasjon_id);
create index idx_etterlevelse_krav_nummer on etterlevelse(krav_nummer);

-- Populer tabellen...

insert into etterlevelse 
    select
        id,
        data ->> 'behandlingId', data ->> 'etterlevelseDokumentasjonId', CAST (data ->> 'kravNummer' AS integer), CAST (data ->> 'kravVersjon' AS integer), data - 'behandlingId' - 'etterlevelseDokumentasjonId' - 'kravNummer' - 'kravVersjon', version,
        created_by,
        created_date,
        last_modified_by, last_modified_date
    from generic_storage
    where type = 'Etterlevelse'
;

-- Drop den gamle indeksen på etterlevelseDokumentasjonId (opprettet i 1.23)...
-- FIXME

-- Slett rader i den gamle tabellen...

delete from generic_storage where type = 'Etterlevelse';

-- Rydd opp i generic_storage...

/*vacuum full generic_storage;*/

-- Oppdater audit_version...

-- FIXME




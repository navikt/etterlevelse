-- Denne migrasjonen trekker etterlevelse dokumentasjon ut til egen tabell

-- Lag ny tabell...

create table if not exists etterlevelse_dokumentasjon
(
    id                 uuid primary key,
    data               jsonb     not null,
    version            integer   not null,
    created_by         text      not null,
    created_date       timestamp not null,
    last_modified_by   text      not null,
    last_modified_date timestamp not null
)
;

-- Populer tabellen...

insert into etterlevelse_dokumentasjon 
    select
        id,
        data, 
        version,
        created_by,
        created_date,
        last_modified_by,
        last_modified_date
    from generic_storage
    where type = 'EtterlevelseDokumentasjon'
;

-- Slett rader i den gamle tabellen...

delete from generic_storage where type = 'EtterlevelseDokumentasjon'
;

-- Denne migrasjonen trekker etterlevelse dokumentasjon ut til egen tabell
-- Den endrer også etterlevelse (tabell) slik at etterlevelse_dokumentasjon_id blir en fremmednøkkel

-- ---------------------------------------------
-- Etterlevelse dokumentasjon ut til egen tabell
-- ---------------------------------------------

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

-- ---------------------------------------------------------------------
-- Gjøre etterlevelse.etterlevelse_dokumentasjon_id til en fremmednøkkel
-- ---------------------------------------------------------------------

-- Drop indeks på kolonnen...
drop index idx_etterlevelse_dokumentasjon_id
;

-- Endre typen til etterlevelse.etterlevelse_dokumentasjon_id til UUID...
alter table etterlevelse
alter column etterlevelse_dokumentasjon_id type uuid using (etterlevelse_dokumentasjon_id::uuid)
;

-- Gjør den til en fremmednøkkel...
alter table etterlevelse
add constraint fk_etterlevelse_etterlevelse_dokumentasjon_id
foreign key (etterlevelse_dokumentasjon_id)
references etterlevelse_dokumentasjon (id)
;

-- Gjenopprett indeks på kolonnen...
create index idx_etterlevelse_dokumentasjon_id on etterlevelse (etterlevelse_dokumentasjon_id)
;


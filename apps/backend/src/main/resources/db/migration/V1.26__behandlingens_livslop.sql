drop index idx_pvk_dokument_fil_pvk_dokument_id;

drop table pvk_dokument_fil;

create table if not exists behandlingens_livslop
(
    id                 uuid primary key,
    etterlevelse_dokumentasjon_id      text not null,
    status             text not null,
    data               jsonb not null,
    version            integer not null,
    created_by         text not null,
    created_date       timestamp not null,
    last_modified_by   text not null,
    last_modified_date timestamp not null
);

create index if not exists idx_behandlingens_livslop_etterlevelse_dokumentasjon_id on behandlingens_livslop (etterlevelse_dokumentasjon_id);

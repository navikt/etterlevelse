create table if not exists pvk_dokument
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

create index if not exists idx_pvk_dokument_etterlevelse_dokumentasjon_id on pvk_dokument (etterlevelse_dokumentasjon_id);

create table if not exists pvk_dokument_fil
(
    id                 uuid primary key,
    pvk_dokument_id    text not null,
    file_name          text not null,
    file_type          text not null,
    file_content       bytea     not null,
    version            integer   not null,
    created_by         text      not null,
    created_date       timestamp not null,
    last_modified_by   text      not null,
    last_modified_date timestamp not null
);

create index if not exists idx_pvk_dokument_fil_pvk_dokument_id on pvk_dokument_fil (pvk_dokument_id);
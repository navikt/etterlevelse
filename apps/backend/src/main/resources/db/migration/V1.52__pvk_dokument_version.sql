create table if not exists pvk_dokument_version
(
    id                       uuid primary key,
    pvk_dokument_id          uuid      not null,
    etterlevelse_dokumentasjon_id text not null,
    status                   text      not null,
    data                     jsonb     not null,
    version                  integer   not null,
    created_by               text      not null,
    created_date             timestamp not null,
    last_modified_by         text      not null,
    last_modified_date       timestamp not null
);

create index if not exists idx_pvk_dokument_version_pvk_dokument_id on pvk_dokument_version (pvk_dokument_id);
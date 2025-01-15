
create table if not exists tiltak
(
    id                 uuid primary key,
    pvk_dokument_id    text not null,
    data               jsonb not null,
    version            integer not null,
    created_by         text not null,
    created_date       timestamp not null,
    last_modified_by   text not null,
    last_modified_date timestamp not null
);

create index if not exists idx_tiltak_pvk_dokument_id on tiltak (pvk_dokument_id);
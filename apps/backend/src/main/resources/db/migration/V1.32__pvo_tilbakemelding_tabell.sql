create table if not exists pvo_tilbakemelding
(
    id                 uuid primary key,
    pvk_dokument_id    uuid references pvk_dokument(id),
    status             text not null,
    data               jsonb not null,
    version            integer not null,
    created_by         text not null,
    created_date       timestamp not null,
    last_modified_by   text not null,
    last_modified_date timestamp not null
);

create index if not exists idx_pvo_tilbakemelding_pvk_dokument_id on pvo_tilbakemelding (pvk_dokument_id);




create table if not exists tiltak
(
    id                 uuid primary key,
    pvk_dokument_id    uuid references pvk_dokument(id),
    data               jsonb not null,
    version            integer not null,
    created_by         text not null,
    created_date       timestamp not null,
    last_modified_by   text not null,
    last_modified_date timestamp not null
);

create index if not exists idx_tiltak_pvk_dokument_id on tiltak (pvk_dokument_id);

create table if not exists risikoscenario_tiltak
(
    risikoscenario      uuid references risikoscenario(id),
    tiltak              uuid references tiltak(id)
);

create index if not exists idx_risikoscenario_tiltak_risikoscenario on risikoscenario_tiltak (risikoscenario);
create index if not exists idx_risikoscenario_tiltak_tiltak on risikoscenario_tiltak (tiltak);


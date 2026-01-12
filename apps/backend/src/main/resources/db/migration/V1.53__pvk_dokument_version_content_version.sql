alter table if exists pvk_dokument_version
    add column if not exists content_version integer not null default 1;
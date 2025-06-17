create table if not exists P360_ARCHIVE_DOCUMENT
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
CREATE TABLE IF NOT EXISTS ETTERLEVELSE
(
    ID                 UUID PRIMARY KEY,
    
    DATA               JSONB     NOT NULL,
    CREATED_BY         TEXT      NOT NULL,
    CREATED_DATE       TIMESTAMP NOT NULL,
    LAST_MODIFIED_BY   TEXT      NOT NULL,
    LAST_MODIFIED_DATE TIMESTAMP NOT NULL,
    VERSION            INTEGER   NOT NULL
);

-- FIXME: Legg til indekser

-- FIXME: Legg til migrering

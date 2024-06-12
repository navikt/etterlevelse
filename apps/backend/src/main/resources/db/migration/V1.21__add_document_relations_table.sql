CREATE TABLE IF NOT EXISTS DOCUMENT_RELATION
(
    ID                 UUID PRIMARY KEY,
    TYPE               TEXT      NOT NULL,
    FROM               TEXT      NOT NULL,
    TO                 TEXT      NOT NULL,
);
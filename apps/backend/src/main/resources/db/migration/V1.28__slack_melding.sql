-- Oppretter arbeidstabell for slack meldinger som skal sendes

create table if not exists slack_melding
(
    id                 serial primary key,
    data               jsonb not null
)

-- This script adds foreig key constraint to pvk_dokument.etterlevelse_dokumentasjon_id

-- Change type of etterlevelse_dokumentasjon_id to UUID...
alter table pvk_dokument
alter column etterlevelse_dokumentasjon_id type uuid using (etterlevelse_dokumentasjon_id::uuid)
;

-- Add index...
create index idx_pvk_dokument_ettdok_id on pvk_dokument (etterlevelse_dokumentasjon_id)
;

-- Delete orphan relations...
delete from pvk_dokument pdok
where not exists (select 1 from etterlevelse_dokumentasjon ed where pdok.etterlevelse_dokumentasjon_id = ed.id)
;

-- Add fk constraints...
alter table pvk_dokument
add constraint fk_pvk_dokument_etterlevelse_dokumentasjon_id
foreign key (etterlevelse_dokumentasjon_id)
references etterlevelse_dokumentasjon (id)
;

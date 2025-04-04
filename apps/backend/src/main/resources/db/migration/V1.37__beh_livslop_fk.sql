-- This script adds foreig key constraint to behandlingens_livslop.etterlevelse_dokumentasjon_id

-- Change type of etterlevelse_dokumentasjon_id to UUID...
alter table behandlingens_livslop
alter column etterlevelse_dokumentasjon_id type uuid using (etterlevelse_dokumentasjon_id::uuid)
;

-- Add index...
create index idx_behandlingens_livslop_ettdok_id on behandlingens_livslop (etterlevelse_dokumentasjon_id)
;

-- Delete orphan relations...
delete from behandlingens_livslop bl
where not exists (select 1 from etterlevelse_dokumentasjon ed where bl.etterlevelse_dokumentasjon_id = ed.id)
;

-- Add fk constraints...
alter table behandlingens_livslop
add constraint fk_behandlingens_livslop_etterlevelse_dokumentasjon_id
foreign key (etterlevelse_dokumentasjon_id)
references etterlevelse_dokumentasjon (id)
;

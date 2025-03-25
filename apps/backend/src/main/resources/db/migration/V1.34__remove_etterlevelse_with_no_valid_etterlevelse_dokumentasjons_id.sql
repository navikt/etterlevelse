-- Slett foreldreløse etterlevelser...
delete from etterlevelse e
where not exists (select 1 from etterlevelse_dokumentasjon ed where e.etterlevelse_dokumentasjon_id = ed.id)
;
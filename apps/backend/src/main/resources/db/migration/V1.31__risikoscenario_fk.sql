-- Endre risikoscenario.pvk_dokument_id, slik at den blir av samme type som det den refererer til... 
alter table risikoscenario
alter column pvk_dokument_id type uuid
using uuid(pvk_dokument_id::text)
;


-- Slett alle risikoscenarioer som ikke er lenket til en gyldig pvk dokument...
delete from risikoscenario r
where not exists (select * from pvk_dokument p where p.id = r.pvk_dokument_id)
;


-- Sleng på fk...
alter table risikoscenario
add constraint fk_risikoscenario_pvk_dokument
foreign key (pvk_dokument_id)
references pvk_dokument (id)
;


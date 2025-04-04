-- This script adds foreig key constraints to document_relation

-- Change type of from_document and to_document to UUID...
alter table document_relation
alter column from_document type uuid using (from_document::uuid),
alter column to_document type uuid using (to_document::uuid)
;

-- Delete orphan relations...
delete from document_relation dr
where not exists (select 1 from etterlevelse_dokumentasjon ed1 where dr.from_document = ed1.id)
  or not exists (select 1 from etterlevelse_dokumentasjon ed2 where dr.to_document = ed2.id)
;

-- Add fk constraints...
alter table document_relation
add constraint fk_document_relation_from
foreign key (from_document)
references etterlevelse_dokumentasjon (id)
;

alter table document_relation
add constraint fk_document_relation_to
foreign key (to_document)
references etterlevelse_dokumentasjon (id)
;

-- Not adding indices, since this table will have a low rowcount

-- Delete duplicate relations (if any)...
delete from document_relation dup
where exists ( -- newer relation between the documents
    select 1 from document_relation dr
    where dr.from_document = dup.from_document
      and dr.to_document = dup.to_document
      and dr.last_modified_date > dup.last_modified_date
)
;

-- Add missing unique constraint...
alter table document_relation
add constraint uq_document_relation
unique (from_document, to_document)
;

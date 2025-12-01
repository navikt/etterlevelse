create table if not exists BEHANDLINGENS_ART_OG_OMFANG
(
    id
    uuid
    primary
    key,
    etterlevelse_dokumentasjon_id
    uuid
    not
    null,
    data
    jsonb
    not
    null,
    version
    integer
    not
    null,
    created_by
    text
    not
    null,
    created_date
    timestamp
    not
    null,
    last_modified_by
    text
    not
    null,
    last_modified_date
    timestamp
    not
    null
);

create index if not exists idx_art_of_omfang_etterlevelse_dokumentasjon_id on BEHANDLINGENS_ART_OG_OMFANG (etterlevelse_dokumentasjon_id);

alter table BEHANDLINGENS_ART_OG_OMFANG
    add constraint fk_art_og_omfang_etterlevelse_dokumentasjon_id
        foreign key (etterlevelse_dokumentasjon_id)
            references etterlevelse_dokumentasjon (id)
;


drop index idx_pvk_dokument_etterlevelse_dokumentasjon_id;

insert into BEHANDLINGENS_ART_OG_OMFANG
select gen_random_uuid(),
       pd.etterlevelse_dokumentasjon_id,
       pd.data,
       pd.version,
       pd.created_by,
       pd.created_date,
       pd.last_modified_by,
       pd.last_modified_date
from pvk_dokument pd;

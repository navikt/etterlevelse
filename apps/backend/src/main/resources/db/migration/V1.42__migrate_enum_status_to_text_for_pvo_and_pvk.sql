update pvo_tilbakemelding set status = (
    case
        when status = '0' then 'IKKE_PABEGYNT'
        when status = '1' then 'AVVENTER'
        when status = '2' then 'TRENGER_REVURDERING'
        when status = '3' then 'UNDERARBEID'
        when status = '4' then 'SNART_FERDIG'
        when status = '5' then 'TIL_KONTROL'
        when status = '6' then 'UTGAAR'
        when status = '7' then 'FERDIG'
        else 'UNDERARBEID'
        end
);

update PVK_DOKUMENT set status = (
    case
        when status = '0' then 'UNDERARBEID'
        when status = '1' then 'SENDT_TIL_PVO'
        when status = '2' then 'PVO_UNDERARBEID'
        when status = '3' then 'VURDERT_AV_PVO'
        when status = '4' then 'VURDERT_AV_PVO_TRENGER_MER_ARBEID'
        when status = '5' then 'SENDT_TIL_PVO_FOR_REVURDERING'
        when status = '6' then 'TRENGER_GODKJENNING'
        when status = '7' then 'GODKJENT_AV_RISIKOEIER'
        when status = '8' then 'AKTIV'
        else 'UNDERARBEID'
        end
    );
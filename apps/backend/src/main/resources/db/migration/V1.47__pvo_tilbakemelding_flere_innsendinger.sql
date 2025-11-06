UPDATE PVO_TILBAKEMELDING
SET data = jsonb_set(data, '{vurderinger}', jsonb_build_array(data)::jsonb, true)
    - 'innsendingId' - 'behandlingenslivslop'
    - 'behandlingensArtOgOmfang' - 'tilhorendeDokumentasjon'
    - 'innvolveringAvEksterne' - 'risikoscenarioEtterTiltakk'
    - 'merknadTilEtterleverEllerRisikoeier' - 'sendtDato'
    - 'ansvarlig' - 'arbeidGarVidere' - 'arbeidGarVidereBegrunnelse'
    - 'behovForForhandskonsultasjon' - 'behovForForhandskonsultasjonBegrunnelse'
    - 'pvoVurdering' - 'pvoFolgeOppEndringer' - 'vilFaPvkIRetur';
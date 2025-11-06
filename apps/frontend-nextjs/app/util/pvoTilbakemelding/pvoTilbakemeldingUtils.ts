import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'

export const addNewVurderingToPvoTilbakemelding = (
  pvoTilbakemelding: IPvoTilbakemelding,
  innsendingId: number
) => {
  pvoTilbakemelding.vurderinger.push(mapNewPvoVurderning(innsendingId))
  return pvoTilbakemelding
}

export const mapNewPvoVurderning = (newInnsendingId: number) => {
  return {
    innsendingId: newInnsendingId,
    merknadTilEtterleverEllerRisikoeier: '',
    sendtDato: '',
    ansvarlig: [],
    ansvarligData: [],
    arbeidGarVidere: undefined,
    behovForForhandskonsultasjon: undefined,
    arbeidGarVidereBegrunnelse: '',
    behovForForhandskonsultasjonBegrunnelse: '',
    pvoVurdering: '',
    pvoFolgeOppEndringer: false,
    vilFaPvkIRetur: false,
    behandlingenslivslop: {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    behandlingensArtOgOmfang: {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    tilhorendeDokumentasjon: {
      sistRedigertAv: '',
      sistRedigertDato: '',
      internDiskusjon: '',
      behandlingskatalogDokumentasjonTilstrekkelig: '',
      behandlingskatalogDokumentasjonTilbakemelding: '',
      kravDokumentasjonTilstrekkelig: '',
      kravDokumentasjonTilbakemelding: '',
      risikovurderingTilstrekkelig: '',
      risikovurderingTilbakemelding: '',
    },

    innvolveringAvEksterne: {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
    risikoscenarioEtterTiltakk: {
      sistRedigertAv: '',
      sistRedigertDato: '',
      bidragsVurdering: '',
      internDiskusjon: '',
      tilbakemeldingTilEtterlevere: '',
    },
  }
}

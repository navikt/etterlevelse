import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'

export const addNewVurderingToPvoTilbakemelding = (
  pvoTilbakemelding: IPvoTilbakemelding,
  innsendingId: number
) => {
  pvoTilbakemelding.vurderinger.push(createNewPvoVurderning(innsendingId))
  return pvoTilbakemelding
}

export const createNewPvoVurderning = (newInnsendingId: number) => {
  return {
    innsendingId: newInnsendingId,
    internDiskusjon: '',
    merknadTilEtterleverEllerRisikoeier: '',
    sendtAv: '',
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
      behandlingsInternDiskusjon: '',

      kravDokumentasjonTilstrekkelig: '',
      kravDokumentasjonTilbakemelding: '',
      kravInternDiskusjon: '',

      risikovurderingTilstrekkelig: '',
      risikovurderingTilbakemelding: '',
      risikovurderingInternDiskusjon: '',
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

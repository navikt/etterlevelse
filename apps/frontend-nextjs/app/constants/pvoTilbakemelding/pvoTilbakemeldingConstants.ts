import { IDomainObject } from '../commonConstants'
import { ITeamResource } from '../teamkatalogen/teamkatalogConstants'

export interface IPvoTilbakemelding extends IDomainObject {
  id: string
  pvkDokumentId: string
  status: EPvoTilbakemeldingStatus
  behandlingenslivslop: ITilbakemeldingsinnhold
  behandlingensArtOgOmfang: ITilbakemeldingsinnhold
  tilhorendeDokumentasjon: ITilhorendeDokumentasjonTilbakemelding
  innvolveringAvEksterne: ITilbakemeldingsinnhold
  risikoscenarioEtterTiltakk: ITilbakemeldingsinnhold
  merknadTilEtterleverEllerRisikoeier: string
  sendtDato: string
  ansvarlig: string[]
  ansvarligData?: ITeamResource[]
  arbeidGarVidere?: boolean
  behovForForhandskonsultasjon?: boolean
  arbeidGarVidereBegrunnelse?: string
  behovForForhandskonsultasjonBegrunnelse?: string
  pvoVurdering?: string
  pvoFolgeOppEndringer?: boolean
  vilFaPvkIRetur?: boolean
}

export enum EPvoTilbakemeldingStatus {
  IKKE_PABEGYNT = 'IKKE_PABEGYNT',
  AVVENTER = 'AVVENTER',
  TRENGER_REVURDERING = 'TRENGER_REVURDERING',
  UNDERARBEID = 'UNDERARBEID',
  SNART_FERDIG = 'SNART_FERDIG',
  TIL_KONTROL = 'TIL_KONTROL',
  FERDIG = 'FERDIG',
  UTGAAR = 'UTGAAR',
}

export interface ITilbakemeldingsinnhold {
  sistRedigertAv: string
  sistRedigertDato: string
  bidragsVurdering: string
  internDiskusjon: string
  tilbakemeldingTilEtterlevere: string
}

export interface ITilhorendeDokumentasjonTilbakemelding {
  sistRedigertAv: string
  sistRedigertDato: string
  internDiskusjon: string
  behandlingskatalogDokumentasjonTilstrekkelig: string
  behandlingskatalogDokumentasjonTilbakemelding: string
  kravDokumentasjonTilstrekkelig: string
  kravDokumentasjonTilbakemelding: string
  risikovurderingTilstrekkelig: string
  risikovurderingTilbakemelding: string
}

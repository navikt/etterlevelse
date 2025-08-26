import { IVarslingsadresse } from '../../teamkatalogen/varslingsadresse/varslingsadresseConstants'

export enum ETilbakemeldingRolle {
  KRAVEIER = 'KRAVEIER',
  MELDER = 'MELDER',
}

export enum ETilbakemeldingType {
  GOD = 'GOD',
  UKLAR = 'UKLAR',
  ANNET = 'ANNET',
}

export enum ETilbakemeldingMeldingStatus {
  UBESVART = 'UBESVART',
  BESVART = 'BESVART',
  MIDLERTIDLIG_SVAR = 'MIDLERTIDLIG_SVAR',
}

export interface ITilbakemeldingMelding {
  meldingNr: number
  fraIdent: string
  rolle: ETilbakemeldingRolle
  tid: string
  innhold: string
  endretTid?: string
  endretAvIdent?: string
}

export interface ITilbakemelding {
  kravId: string
  kravNummer: number
  kravVersjon: number
  type: ETilbakemeldingType
  melderIdent: string
  meldinger: ITilbakemeldingMelding[]
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface ICreateTilbakemeldingRequest {
  kravNummer: number
  kravVersjon: number
  type: ETilbakemeldingType
  varslingsadresse: IVarslingsadresse
  foersteMelding: string
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface ITilbakemeldingNewMeldingRequest {
  tilbakemeldingId: string
  melding: string
  rolle: ETilbakemeldingRolle
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}

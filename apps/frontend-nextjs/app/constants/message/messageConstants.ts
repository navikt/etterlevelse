import { EAlertType, IDomainObject, IVarslingsadresse } from '@/constants/commonConstants'
import { ReactNode } from 'react'

export enum EMeldingType {
  SYSTEM = 'SYSTEM',
  FORSIDE = 'FORSIDE',
  OM_ETTERLEVELSE = 'OM_ETTERLEVELSE',
}

export enum EMeldingStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
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

export enum ETilbakemeldingRolle {
  KRAVEIER = 'KRAVEIER',
  MELDER = 'MELDER',
}
export interface IMelding extends IDomainObject {
  id: string
  melding: string
  secondaryTittel: string
  secondaryMelding: string
  meldingType: EMeldingType
  meldingStatus: EMeldingStatus
  alertType: EAlertType
}
export type TSporsmaalOgSvarKrav = {
  kravNavn: string
  tidForSporsmaal: string
  tidForSvar?: string
  melderNavn: ReactNode
  tema?: string
}
export interface ITilbakemelding {
  id: string
  kravNummer: number
  kravVersjon: number
  type: ETilbakemeldingType
  melderIdent: string
  meldinger: ITilbakemeldingMelding[]
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
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
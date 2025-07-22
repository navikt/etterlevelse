export interface IExternalCode {
  list: string
  code: string
  shortName: string
  description: string
}

export interface IPolicy {
  behandlingId: string
  id: string
  opplysningsTypeId: string
  opplysningsTypeNavn: string
  personKategorier: IExternalCode[]
  sensitivity: IExternalCode[]
}

export interface IDataBehandler {
  id: string
  navn: string
}

export interface IBehandling {
  id: string
  navn: string
  nummer: number
  overordnetFormaal: IExternalCode
  formaal?: string
  avdeling?: IExternalCode
  linjer: IExternalCode[]
  systemer: IExternalCode[]
  teams: string[]
  policies: IPolicy[]
  dataBehandlerList: IDataBehandler[]
  automatiskBehandling: boolean
  profilering: boolean
}

export interface IBegrep {
  id: string
  navn: string
  beskrivelse: string
}

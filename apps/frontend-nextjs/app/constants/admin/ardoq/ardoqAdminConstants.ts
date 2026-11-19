export interface IArdoqSyncData {
  system_id: string
  etterlevelses_dokument_id: string
}

export interface IRawArdoqJsonData {
  ardoq_id: string
  system_name: string
  dokumentnavn: string
  etterlevelses_dokument_nummer: string
  antall_krav: number
  krav_ferdig: number
  krav_ikke_startet: number
  krav_under_arbeid: number
  link_til_etterlevelses_dokument: string
}

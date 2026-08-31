export interface IDeletedEtterlevelseDokumentasjon {
  id: string
  etterlevelseNummer: number
  etterlevelseDokumentVersjon: number
  title: string
  deletedTime: string
  deletedBy: string
  hadPvk: boolean
}

export interface IRestoreResult {
  etterlevelseDokumentasjonId: string
  restoredEtterlevelser: number
  restoredEtterlevelseMetadata: number
  restoredBehandlingensLivslop: number
  restoredBehandlingensArtOgOmfang: number
  restoredPvkDokument: number
  restoredRisikoscenario: number
  restoredTiltak: number
  restoredPvoTilbakemelding: number
  warnings: string[]
}

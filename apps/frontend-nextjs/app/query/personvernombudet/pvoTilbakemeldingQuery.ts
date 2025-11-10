import { gql } from '@apollo/client'

export const getPvoTilbakemeldingListQuery = gql`
  query getPvoTilbakemeldinger(
    $pageNumber: NonNegativeInt
    $pageSize: NonNegativeInt
    $sistRedigert: NonNegativeInt
  ) {
    pvoTilbakemeldinger: pvoTilbakemelding(
      filter: { sistRedigert: $sistRedigert }
      pageNumber: $pageNumber
      pageSize: $pageSize
    ) {
      pageNumber
      pageSize
      pages
      numberOfElements
      totalElements
      content {
        id
        status
        pvkDokumentId
        pvkDokumentStatus
        etterlevelseDokumentasjonId
        etterlevelseDokumentasjonData {
          title
          etterlevelseNummer
        }
        vurderinger {
          innsendingId
          sendtDato
        }
        sistEndretAvMeg
        changeStamp {
          createdDate
        }
        antallInnsendingTilPvo
      }
    }
  }
`

export type TPvoVariables = {
  pageNumber?: number
  pageSize?: number
  sistRedigert?: number
}

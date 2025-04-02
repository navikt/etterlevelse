import { gql } from '@apollo/client'

// eslint-disable-next-line "@typescript-eslint/no-restricted-types"
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
        sendtDato
        sistEndretAvMeg
        changeStamp {
          createdDate
        }
      }
    }
  }
`

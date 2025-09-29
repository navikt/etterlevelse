import { gql } from '@apollo/client'

export const getEtterlevelseDokumentasjonListQuery = gql`
  query getEtterlevelseDokumentasjoner(
    $pageNumber: NonNegativeInt
    $pageSize: NonNegativeInt
    $mineEtterlevelseDokumentasjoner: Boolean
    $sistRedigert: NonNegativeInt
    $sok: String
    $behandlingId: String
  ) {
    etterlevelseDokumentasjoner: etterlevelseDokumentasjon(
      filter: {
        mineEtterlevelseDokumentasjoner: $mineEtterlevelseDokumentasjoner
        sistRedigert: $sistRedigert
        sok: $sok
        behandlingId: $behandlingId
      }
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
        title
        etterlevelseNummer
        sistEndretEtterlevelse
        sistEndretEtterlevelseAvMeg
        sistEndretDokumentasjonAvMeg
        changeStamp {
          createdDate
        }
        teamsData {
          id
          name
        }
      }
    }
  }
`

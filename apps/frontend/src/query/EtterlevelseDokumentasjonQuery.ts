import { gql } from '@apollo/client'

// eslint-disable-next-line @typescript-eslint/ban-types
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

export const getEtterlevelseDokumentasjonByBehandlingIdQuery = gql`
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
        teamsData {
          id
          name
        }
        behandlinger {
          id
          navn
          nummer
        }
      }
    }
  }
`

export const getEtterlevelseDokumentasjonStatsQuery = gql`
  query getEtterlevelseDokumentasjonStats($etterlevelseDokumentasjonId: ID) {
    etterlevelseDokumentasjon(filter: { id: $etterlevelseDokumentasjonId }) {
      content {
        stats {
          relevantKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          irrelevantKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          utgaattKrav {
            kravNummer
            kravVersjon
            navn
            status
            aktivertDato
            etterlevelser(etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId) {
              behandlingId
              status
              etterlevelseDokumentasjonId
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
        }
      }
    }
  }
`
// eslint-enable-next-line @typescript-eslint/ban-types

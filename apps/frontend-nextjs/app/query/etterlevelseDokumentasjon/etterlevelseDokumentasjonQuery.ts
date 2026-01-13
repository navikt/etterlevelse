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
        prioritertKravNummer
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
            tagger
            etterlevelser(
              onlyForEtterlevelseDokumentasjon: true
              etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
            ) {
              status
              id
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              suksesskriterieBegrunnelser {
                suksesskriterieStatus
              }
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
            tagger
            etterlevelser(
              onlyForEtterlevelseDokumentasjon: true
              etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
            ) {
              id
              status
              etterlevelseDokumentasjonId
              fristForFerdigstillelse
              suksesskriterieBegrunnelser {
                suksesskriterieStatus
              }
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
            etterlevelser(
              onlyForEtterlevelseDokumentasjon: true
              etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
            ) {
              id
              behandlingId
              status
              etterlevelseDokumentasjonId
              suksesskriterieBegrunnelser {
                suksesskriterieStatus
              }
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

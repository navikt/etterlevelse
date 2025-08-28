import { IPageResponse } from '@/constants/commonConstants'
import { TKravFilters, TKravQL } from '@/constants/krav/kravConstants'
import { QueryHookOptions, gql, useQuery } from '@apollo/client'

export const useKravCounter = (
  variables: { lover: string[] },
  options?: QueryHookOptions<any, { lover?: string[] }>
) => {
  let filter = {}
  if (options) {
    filter = { ...options }
  }
  filter = { ...filter, variables }
  return useQuery<{ krav: IPageResponse<TKravQL> }, TKravFilters>(getKravByLovCodeQuery, filter)
}

const getKravByLovCodeQuery = gql`
  query countKrav($lover: [String!]) {
    krav(filter: { lover: $lover, gjeldendeKrav: true }) {
      numberOfElements
      content {
        id
        kravNummer
        kravVersjon
        navn
        relevansFor {
          code
        }
      }
    }
  }
`

export const getKravWithEtterlevelseQuery = gql`
  query getKravWithEtterlevelse($kravId: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $kravId, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon
      changeStamp {
        lastModifiedBy
        lastModifiedDate
      }
      navn
      beskrivelse
      hensikt
      notat
      varselMelding
      utdypendeBeskrivelse
      versjonEndringer
      aktivertDato
      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      varslingsadresserQl {
        adresse
        type
        slackChannel {
          id
          name
          numMembers
        }
        slackUser {
          id
          name
        }
      }
      rettskilder
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      tagger

      avdeling {
        code
        shortName
      }
      underavdeling {
        code
        shortName
      }
      relevansFor {
        code
        shortName
      }
      status

      suksesskriterier {
        id
        navn
        beskrivelse
        behovForBegrunnelse
      }

      kravIdRelasjoner
      kravRelasjoner {
        id
        kravNummer
        kravVersjon
        navn
      }
      etterlevelser(onlyForEtterlevelseDokumentasjon: false) {
        id
        etterlevelseDokumentasjon {
          id
          etterlevelseNummer
          title
          teamsData {
            id
            name
            productAreaId
            productAreaName
          }
        }
        changeStamp {
          lastModifiedDate
          lastModifiedBy
        }
        status
        suksesskriterieBegrunnelser {
          suksesskriterieId
          begrunnelse
          suksesskriterieStatus
        }
      }
    }
  }
`

// eslint-enable-next-line @typescript-eslint/ban-types

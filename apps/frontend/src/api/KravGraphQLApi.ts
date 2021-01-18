import axios from 'axios'
import {env} from '../util/env'
import {Behandling, Etterlevelse, GraphQLResponse, Krav} from '../constants'
import {useEffect, useState} from 'react'

const kravtableQuery = `query getKravByFilter ($relevans: [String!], $nummer: Int){
  krav(filter: {relevans: $relevans, nummer: $nummer}) {
    id
    navn
    kravNummer
    kravVersjon
    status
    avdeling {
      code
      shortName
    }
    underavdeling {
      code
      shortName
    }
    etterlevelser {
        id
    }
  }
}`

export type KravFilters = {relevans?: string[], nummer?: number}
type KravFilterType = Krav & {etterlevelser: (Etterlevelse & {behandling: Behandling})[]}

export const getKrav = async (variables: KravFilters, query: string) => {
  return (await axios.post<GraphQLResponse<{krav: KravFilterType[]}>>(`${env.backendBaseUrl}/graphql`, {
    query,
    variables
  })).data.data.krav
}

export const useKravFilter = (variables: KravFilters, query?: string) => {
  const values = Object.values(variables)
  const filterActive = !!values.find(v => Array.isArray(v) ? !!v.length : !!v)

  const [data, setData] = useState<KravFilterType []>([])
  const [loading, setLoading] = useState(filterActive)

  useEffect(() => {
    if (filterActive) {
      setLoading(true)
      setData([])
      getKrav(variables, query || kravtableQuery).then(r => {
        setData(r);
        setLoading(false)
      })
    }
  }, [variables.relevans, variables.nummer, query])

  return [data, loading] as [KravFilterType[], boolean]
}

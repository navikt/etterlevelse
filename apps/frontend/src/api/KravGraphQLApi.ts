import axios from 'axios'
import {env} from '../util/env'
import {Etterlevelse, GraphQLResponse, Krav} from '../constants'
import {useEffect, useState} from 'react'

const kravtableQuery = `query getKravByFilter ($relevans: String, $nummer: Int){
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

export type KravFilters = {relevans?: string, nummer?: number}
type KravFilterType = Krav & {etterlevelser: Etterlevelse[]}
export const getKrav = async (variables: KravFilters) => {
  return (await axios.post<GraphQLResponse<{krav: KravFilterType[]}>>(`${env.backendBaseUrl}/graphql`, {
    query: kravtableQuery,
    variables
  })).data.data.krav
}


export const useKravFilter = (variables: KravFilters) => {
  const values = Object.values(variables)
  const filterActive = !!values.find(v => !!v)

  const [data, setData] = useState<KravFilterType []>([])
  const [loading, setLoading] = useState(filterActive)

  useEffect(() => {
    if (filterActive) {
      setLoading(true)
      setData([])
      getKrav(variables).then(r => {
        setData(r);
        setLoading(false)
      })
    }
  }, [variables.relevans, variables.nummer])

  return [data, loading] as [KravFilterType[], boolean]
}

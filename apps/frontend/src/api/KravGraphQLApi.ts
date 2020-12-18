import axios from 'axios'
import {env} from '../util/env'
import {Etterlevelse, GraphQLResponse, Krav} from '../constants'
import {useEffect, useState} from 'react'

const kravtableQuery = `query getKravByFilter ($relevans: String, $nummer: Int){
    krav(relevans: $relevans, nummer: $nummer) {
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

type KravFilters = {relevans?: string, nummer?: number}
type KravFilterType = Krav & {etterlevelser: Etterlevelse[]}
export const getKrav = async (variables: KravFilters) => {
  return (await axios.post<GraphQLResponse<{krav: KravFilterType[]}>>(`${env.backendBaseUrl}/graphql`, {
    query: kravtableQuery,
    variables
  })).data.data.krav
}


export const useKravFilter = (variables: KravFilters) => {
  const [data, setData] = useState<KravFilterType []>([])

  useEffect(() => {
    const values = Object.values(variables)
    values.find(v => !!v) && getKrav(variables).then(setData)
  }, [variables.relevans, variables.nummer])

  return data
}

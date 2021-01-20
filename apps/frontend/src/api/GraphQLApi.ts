import axios from 'axios'
import {GraphQLResponse} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'
import {DocumentNode} from 'graphql'

export const get = async <T>(variables: any, query: DocumentNode) => {
  const data = (await axios.post<GraphQLResponse<any>>(`${env.backendBaseUrl}/graphql`, {
    query: query.loc?.source.body,
    variables
  })).data.data

  const queryName = (query.definitions[0] as any).selectionSet.selections[0].name.value
  return data[queryName] as T
}

export const useGraphQL = <T>(variables: any, query: DocumentNode) => {
  const values = Object.values(variables)
  const filterActive = !!values.find(v => Array.isArray(v) ? !!v.length : !!v)

  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(filterActive)

  useEffect(() => {
    if (filterActive) {
      setLoading(true)
      setData(undefined)
      get<T>(variables, query).then(r => {
        setData(r);
        setLoading(false)
      })
    }
  }, [...values, query])

  return [data, loading] as [T, boolean]
}

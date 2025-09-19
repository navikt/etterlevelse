import { IKravDataProps } from '@/constants/krav/edit/kravEditConstant'
import { TKravId, TKravIdParams, TKravQL } from '@/constants/krav/kravConstants'
import { getKravWithEtterlevelseQuery } from '@/query/krav/kravQuery'
import { WatchQueryFetchPolicy } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

export const GetKravData = (
  params: Readonly<Partial<TKravIdParams>>
): IKravDataProps | undefined => {
  const filter = {
    variables: getQueryVariableFromParams(params),
    skip: (!params.kravId || params.kravId === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache' as WatchQueryFetchPolicy,
  }

  const { data, loading, refetch } = useQuery<{ kravById: TKravQL }, TKravId>(
    getKravWithEtterlevelseQuery,
    filter
  )

  if (data && data.kravById) {
    return { kravQuery: data, kravLoading: loading, reloadKrav: refetch }
  } else {
    return undefined
  }
}

interface IPropsID {
  kravId: string
}

interface IPropsKravNummerVersjon {
  kravNummer: number
  kravVersjon: number
}

type TPropsGetQueryVariableFromParams = IPropsID | IPropsKravNummerVersjon | undefined

function getQueryVariableFromParams(
  params: Readonly<Partial<TKravIdParams>>
): TPropsGetQueryVariableFromParams {
  if (params.kravId) {
    return { kravId: params.kravId }
  } else if (params.kravNummer && params.kravVersjon) {
    return {
      kravNummer: parseInt(params.kravNummer),
      kravVersjon: parseInt(params.kravVersjon),
    }
  } else {
    return undefined
  }
}

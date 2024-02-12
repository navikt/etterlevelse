import { ApolloQueryResult, useQuery } from '@apollo/client'
import { TKravId as KravIdQueryVariables, TKravIdParams } from '../../api/KravApi'
import { TKravQL } from '../../constants'
import { getKravWithEtterlevelseQuery } from '../../query/KravQuery'

export interface IKravDataProps {
  kravQuery: {
    kravById: TKravQL
  }
  kravLoading: boolean
  reloadKrav: Promise<
    ApolloQueryResult<{
      kravById: TKravQL
    }>
  >
}

export function GetKravData(params: Readonly<Partial<TKravIdParams>>): IKravDataProps | undefined {
  const {
    loading: kravLoading,
    data: kravQuery,
    refetch: reloadKrav,
  } = useQuery<{ kravById: TKravQL }, KravIdQueryVariables>(getKravWithEtterlevelseQuery, {
    variables: getQueryVariableFromParams(params),
    skip: (!params.id || params.id === 'ny') && !params.kravNummer,
    fetchPolicy: 'no-cache',
  })

  if (kravQuery?.kravById) {
    const kravData = { kravQuery: kravQuery, kravLoading: kravLoading, reloadKrav: reloadKrav() }

    return kravData
  } else {
    return undefined
  }
}

interface IPropsID {
  id: string
}

interface IPropsKravNummerVersjon {
  kravNummer: number
  kravVersjon: number
}

type TPropsGetQueryVariableFromParams = IPropsID | IPropsKravNummerVersjon | undefined

function getQueryVariableFromParams(
  params: Readonly<Partial<TKravIdParams>>
): TPropsGetQueryVariableFromParams {
  if (params.id) {
    return { id: params.id }
  } else if (params.kravNummer && params.kravVersjon) {
    return {
      kravNummer: parseInt(params.kravNummer),
      kravVersjon: parseInt(params.kravVersjon),
    }
  } else {
    return undefined
  }
}

import { gql, useQuery } from '@apollo/client'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Loader } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { TYPE } from 'baseui/select'
import { LabelLarge, LabelSmall } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBehandling, useSearchBehandling } from '../../../api/BehandlingApi'
import {
  EtterlevelseDokumentasjonQL,
  IBehandling,
  IPageResponse,
  emptyPage,
} from '../../../constants'
import {
  EtterlevelseDokumentasjonerPanels,
  Variables,
  tabMarginBottom,
} from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import Button from '../../common/Button'
import CustomizedSelect from '../../common/CustomizedSelect'
import { updateBehandlingNameWithNumber } from '../common/utils'

export const BehandlingSok = () => {
  const pageSize = 20
  const [behandlingSearchResult, setBehandlingSearchResult, loadingBehandlingSearchResult] =
    useSearchBehandling()
  const [searchParams, setSearchParams] = useSearchParams()
  const behandlingUUID = searchParams.get('behandlingId')
  const [selectedBehandling, setSelectedBehandling] = useState<IBehandling>()
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<EtterlevelseDokumentasjonQL> },
    Variables
  >(query, {
    variables: {
      behandlingId: selectedBehandling
        ? selectedBehandling.id
        : behandlingUUID
          ? behandlingUUID
          : '',
    },
    skip: selectedBehandling === undefined && (behandlingUUID === null || behandlingUUID === ''),
  })
  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage
  const loading = !data && gqlLoading

  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data && data.etterlevelseDokumentasjoner.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.etterlevelseDokumentasjoner
        const newData = o.fetchMoreResult && o.fetchMoreResult.etterlevelseDokumentasjoner
        return {
          etterlevelseDokumentasjoner: {
            ...oldData,
            pageNumber: newData.pageNumber,
            numberOfElements: oldData.numberOfElements + newData.numberOfElements,
            content: [...oldData.content, ...newData.content],
          },
        }
      },
    }).catch((e) => console.error(e))
  }

  useEffect(() => {
    if (behandlingUUID) {
      getBehandling(behandlingUUID).then((resp) => setSelectedBehandling(resp))
    }
  }, [behandlingUUID])

  const getEtterlevelseDokumentasjonerWithoutDuplicates = () => {
    return etterlevelseDokumentasjoner.content.filter(
      (value, index, self) =>
        index ===
        self.findIndex((etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id)
    )
  }

  const getBehandlingData = () => {
    const behandlinger =
      etterlevelseDokumentasjoner.content && etterlevelseDokumentasjoner.content.length
        ? etterlevelseDokumentasjoner.content[0].behandlinger
        : []
    if (!!behandlinger && behandlinger.length) {
      const behandling = behandlinger.filter(
        (value) => value.id === selectedBehandling?.id || value.id === behandlingUUID
      )[0]
      return 'Dokumentasjoner med B' + behandling.nummer + ' ' + behandling.navn + ' som behandling'
    } else if (selectedBehandling && !(!!behandlinger && behandlinger.length)) {
      return (
        'Fant ingen dokumentasjoner med "B' +
        selectedBehandling.nummer +
        ' ' +
        selectedBehandling.navn +
        '" som behandling'
      )
    }
  }

  return (
    <Block marginBottom={tabMarginBottom}>
      <Block
        maxWidth="600px"
        marginBottom={theme.sizing.scale1000}
        display={'flex'}
        flexDirection={'column'}
      >
        <CustomizedSelect
          placeholder="Søk behandlinger"
          aria-label="Søk behandlinger"
          noResultsMsg={intl.emptyTable}
          maxDropdownHeight="350px"
          searchable={true}
          type={TYPE.search}
          labelKey="navn"
          onInputChange={(event) => setBehandlingSearchResult(event.currentTarget.value)}
          options={updateBehandlingNameWithNumber(behandlingSearchResult)}
          onChange={({ value }) => {
            if (value && value.length > 0) {
              setSelectedBehandling(value[0] as IBehandling)
              searchParams.set('behandlingId', value[0].id ? value[0].id.toString() : '')
              setSearchParams(searchParams)
            }
          }}
          isLoading={loadingBehandlingSearchResult}
        />
      </Block>
      {loading && (
        <Block>
          <Block marginLeft={theme.sizing.scale400} marginTop={theme.sizing.scale400}>
            <Loader size="large" />
          </Block>
        </Block>
      )}

      <Block marginBottom={theme.sizing.scale600}>
        <LabelLarge>{getBehandlingData()}</LabelLarge>
      </Block>

      <EtterlevelseDokumentasjonerPanels
        etterlevelseDokumentasjoner={getEtterlevelseDokumentasjonerWithoutDuplicates()}
        loading={loading}
      />

      {!loading && etterlevelseDokumentasjoner.totalElements !== 0 && (
        <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
          <Block display="flex" alignItems="center">
            <Button
              onClick={lastMer}
              icon={faPlus}
              kind={'secondary'}
              size="compact"
              disabled={
                gqlLoading ||
                etterlevelseDokumentasjoner.numberOfElements >=
                etterlevelseDokumentasjoner.totalElements
              }
            >
              Vis mer
            </Button>

            {gqlLoading && (
              <Block marginLeft={theme.sizing.scale400}>
                <Loader size="large" />
              </Block>
            )}
          </Block>
          <LabelSmall marginRight={theme.sizing.scale400}>
            Viser {etterlevelseDokumentasjoner.numberOfElements}/
            {etterlevelseDokumentasjoner.totalElements}
          </LabelSmall>
        </Block>
      )}
    </Block>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
const query = gql`
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
// eslint-enable-next-line @typescript-eslint/ban-types

export default BehandlingSok

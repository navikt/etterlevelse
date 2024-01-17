import { gql, useQuery } from '@apollo/client'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Label, Loader } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { TYPE } from 'baseui/select'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getBehandling, useSearchBehandling } from '../../../api/BehandlingApi'
import {
  IBehandling,
  IPageResponse,
  TEtterlevelseDokumentasjonQL,
  emptyPage,
} from '../../../constants'
import { TVariables } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { theme } from '../../../util'
import { intl } from '../../../util/intl/intl'
import CustomizedSelect from '../../common/CustomizedSelect'
import { EtterlevelseDokumentasjonsPanels } from '../EtterlevelseDokumentasjonsPanels'
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
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
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
    <div className="my-5">
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
        <div>
          <div className="ml-2.5 mt-2.5">
            <Loader size="large" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label>{getBehandlingData()}</Label>
      </div>

      <EtterlevelseDokumentasjonsPanels
        etterlevelseDokumentasjoner={getEtterlevelseDokumentasjonerWithoutDuplicates()}
        loading={loading}
      />

      {!loading && etterlevelseDokumentasjoner.totalElements !== 0 && (
        <div className="flex justify-between mt-10">
          <div className="flex items-center">
            <Button
              onClick={lastMer}
              icon={<PlusIcon title="" aria-label="" aria-hidden />}
              variant={'secondary'}
              disabled={
                gqlLoading ||
                etterlevelseDokumentasjoner.numberOfElements >=
                  etterlevelseDokumentasjoner.totalElements
              }
            >
              Vis mer
            </Button>

            {gqlLoading && (
              <div className="ml-2.5">
                <Loader size="large" />
              </div>
            )}
          </div>
          <Label className="mr-2.5">
            Viser {etterlevelseDokumentasjoner.numberOfElements}/
            {etterlevelseDokumentasjoner.totalElements}
          </Label>
        </div>
      )}
    </div>
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

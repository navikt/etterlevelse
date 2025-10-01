'use client'

import {
  getBehandling,
  searchBehandlingOptions,
} from '@/api/behandlingskatalog/behandlingskatalogApi'
import { DropdownIndicator } from '@/components/etterlevelse/edit/dropdownIndicator/dropdownIndicator'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getEtterlevelseDokumentasjonByBehandlingIdQuery } from '@/query/etterlevelse/etterlevelseDokumentasjonQuery'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { useQuery } from '@apollo/client/react'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Label, Loader } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { TVariables } from '../dokumentasjonTabs'
import { EtterlevelseDokumentasjonsPanels } from '../panels/etterlevelseDokumentasjonPanels'

export const BehandlingSok = () => {
  const pageSize = 20
  const searchParams = useSearchParams()
  const behandlingUUID = searchParams.get('behandlingId')
  const router = useRouter()
  const [selectedBehandling, setSelectedBehandling] = useState<IBehandling>()
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonByBehandlingIdQuery, {
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
    <div className='my-5'>
      <div className='max-w-[37.5rem] mb-10 flex flex-col'>
        <AsyncSelect
          aria-label='Søk etter behandlinger'
          placeholder='Søk etter behandlinger'
          components={{ DropdownIndicator }}
          noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
          controlShouldRenderValue={false}
          loadingMessage={() => 'Søker...'}
          isClearable={false}
          loadOptions={searchBehandlingOptions}
          onChange={(value) => {
            if (value) {
              const behandlingData = value as IBehandling
              setSelectedBehandling(behandlingData)
              router.push(`?behandlingId=${behandlingData.id}`)
            }
          }}
          styles={selectOverrides}
        />
      </div>

      {loading && (
        <div>
          <div className='ml-2.5 mt-2.5'>
            <Loader size='large' className='flex justify-self-center' />
          </div>
        </div>
      )}

      <div className='mb-4'>
        <Label>{getBehandlingData()}</Label>
      </div>

      <EtterlevelseDokumentasjonsPanels
        etterlevelseDokumentasjoner={getEtterlevelseDokumentasjonerWithoutDuplicates()}
        loading={loading}
      />

      {!loading && etterlevelseDokumentasjoner.totalElements !== 0 && (
        <div className='flex justify-between mt-10'>
          <div className='flex items-center'>
            <Button
              onClick={lastMer}
              icon={<PlusIcon title='' aria-label='' aria-hidden />}
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
              <div className='ml-2.5'>
                <Loader size='large' />
              </div>
            )}
          </div>
          <Label className='mr-2.5'>
            Viser {etterlevelseDokumentasjoner.numberOfElements}/
            {etterlevelseDokumentasjoner.totalElements}
          </Label>
        </div>
      )}
    </div>
  )
}
export default BehandlingSok

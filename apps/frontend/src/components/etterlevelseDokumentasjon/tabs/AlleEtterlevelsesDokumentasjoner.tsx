import { useQuery } from '@apollo/client'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Heading, Label, Loader, Search } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { emptyPage } from '../../../api/util/EmptyPageConstant'
import { IPageResponse, TEtterlevelseDokumentasjonQL } from '../../../constants'
import { TVariables } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { getEtterlevelseDokumentasjonListQuery } from '../../../query/EtterlevelseDokumentasjonQuery'
import { useDebouncedState } from '../../../util/hooks/customHooks'
import { EtterlevelseDokumentasjonsPanels } from '../EtterlevelseDokumentasjonsPanels'

export const AlleEtterlevelsesDokumentasjoner = () => {
  const pageSize = 20
  const [pageNumber, setPage] = useState(0)
  const [sok, setSok] = useDebouncedState('', 300)
  const tooShort = !!sok.length && sok.trim().length < 3
  const {
    data,
    loading: gqlLoading,
    fetchMore,
  } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables: { pageNumber, pageSize, sok },
    skip: tooShort,
  })
  const etterlevelseDokumentasjoner = data?.etterlevelseDokumentasjoner || emptyPage
  const loading = !data && gqlLoading

  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data ? data.etterlevelseDokumentasjoner.pageNumber + 1 : 0,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.etterlevelseDokumentasjoner
        const newData = o.fetchMoreResult?.etterlevelseDokumentasjoner
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
    if (sok && pageNumber !== 0) setPage(0)
  }, [sok])

  const getEtterlevelseDokumentasjonerWithoutDuplicates = () => {
    return etterlevelseDokumentasjoner.content.filter(
      (value, index, self) =>
        index ===
        self.findIndex((etterlevelseDokumentasjon) => etterlevelseDokumentasjon.id === value.id)
    )
  }

  return (
    <div className="my-5">
      <div className="max-w-[37.5rem] mb-10 flex flex-col">
        <Search
          label="Søk i alle dokumentasjoner"
          variant="secondary"
          placeholder="Søk"
          onChange={(inputValue) => setSok(inputValue)}
          clearButton
        />
        {tooShort && <Label>Minimum 3 tegn</Label>}
      </div>

      {!tooShort && (
        <>
          {loading && (
            <div>
              <div className="mx-2.5">
                <Loader size="large" />
              </div>
            </div>
          )}

          {!loading && !!sok && (
            <div>
              <Heading size="small" level="2">
                {etterlevelseDokumentasjoner.totalElements} treff: “{sok}”
              </Heading>
              {!etterlevelseDokumentasjoner.totalElements && <Label>Ingen treff</Label>}
            </div>
          )}

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
        </>
      )}
    </div>
  )
}

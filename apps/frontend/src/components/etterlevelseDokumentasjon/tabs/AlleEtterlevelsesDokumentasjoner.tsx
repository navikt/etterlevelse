import { useQuery } from '@apollo/client'
import { PlusIcon } from '@navikt/aksel-icons'
import { Button, Heading, Label, Loader } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { StatefulInput } from 'baseui/input'
import { useEffect, useState } from 'react'
import { IPageResponse, TEtterlevelseDokumentasjonQL, emptyPage } from '../../../constants'
import { TVariables, query } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { theme } from '../../../util'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors } from '../../../util/theme'
import { clearSearchIcon, searchIcon } from '../../Images'
import { borderWidth } from '../../common/Style'
import { EtterlevelseDokumentasjonsPanels } from '../EtterlevelseDokumentasjonsPanels'

export const AlleEtterlevelsesDokumentasjoner = () => {
  const [hover, setHover] = useState(false)
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
  >(query, {
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
      <Label>Søk i alle dokumentasjoner</Label>
      <Block
        maxWidth="600px"
        marginBottom={theme.sizing.scale1000}
        display={'flex'}
        flexDirection={'column'}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <StatefulInput
          size="compact"
          placeholder="Søk"
          aria-label={'Søk'}
          onChange={(e) => setSok((e.target as HTMLInputElement).value)}
          clearable
          overrides={{
            Root: { style: { paddingLeft: 0, paddingRight: 0, ...borderWidth('1px') } },
            Input: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            StartEnhancer: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            ClearIconContainer: {
              style: {
                backgroundColor: hover ? ettlevColors.green50 : undefined,
              },
            },
            ClearIcon: {
              props: {
                overrides: {
                  Svg: {
                    component: (props: any) => (
                      <Button variant="tertiary" onClick={() => props.onClick()}>
                        <img src={clearSearchIcon} alt="tøm" />
                      </Button>
                    ),
                  },
                },
              },
            },
            // EndEnhancer: {style: {marginLeft: theme.sizing.scale400, paddingLeft: 0, paddingRight: 0, backgroundColor: ettlevColors.black}}
          }}
          startEnhancer={<img src={searchIcon} alt="Søk ikon" />}
          // endEnhancer={<img aria-hidden alt={'Søk ikon'} src={sokButtonIcon} />}
        />
        {tooShort && <Label>Minimum 3 tegn</Label>}
      </Block>

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

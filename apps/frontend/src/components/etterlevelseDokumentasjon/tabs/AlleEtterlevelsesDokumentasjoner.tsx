import { useQuery } from '@apollo/client'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { Loader } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { StatefulInput } from 'baseui/input'
import { HeadingLarge, LabelLarge, LabelSmall, LabelXSmall } from 'baseui/typography'
import { useEffect, useState } from 'react'
import { IPageResponse, TEtterlevelseDokumentasjonQL, emptyPage } from '../../../constants'
import { query } from '../../../pages/KravPage'
import { TVariables, tabMarginBottom } from '../../../pages/MyEtterlevelseDokumentasjonerPage'
import { theme } from '../../../util'
import { useDebouncedState } from '../../../util/hooks'
import { ettlevColors } from '../../../util/theme'
import { clearSearchIcon, searchIcon } from '../../Images'
import Button from '../../common/Button'
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
    <Block marginBottom={tabMarginBottom}>
      <LabelLarge marginBottom={theme.sizing.scale200}>Søk i alle dokumentasjoner</LabelLarge>
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
                      <Button
                        notBold
                        size="compact"
                        kind="tertiary"
                        onClick={() => props.onClick()}
                      >
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
        {tooShort && (
          <LabelSmall
            color={ettlevColors.error400}
            alignSelf={'flex-end'}
            marginTop={theme.sizing.scale200}
          >
            Minimum 3 tegn
          </LabelSmall>
        )}
      </Block>

      {!tooShort && (
        <>
          {loading && (
            <Block>
              <Block marginLeft={theme.sizing.scale400} marginTop={theme.sizing.scale400}>
                <Loader size="large" />
              </Block>
            </Block>
          )}

          {!loading && !!sok && (
            <Block>
              <HeadingLarge color={ettlevColors.green600}>
                {etterlevelseDokumentasjoner.totalElements} treff: “{sok}”
              </HeadingLarge>
              {!etterlevelseDokumentasjoner.totalElements && <LabelXSmall>Ingen treff</LabelXSmall>}
            </Block>
          )}

          <EtterlevelseDokumentasjonsPanels
            etterlevelseDokumentasjoner={getEtterlevelseDokumentasjonerWithoutDuplicates()}
            loading={loading}
          />

          {!loading && etterlevelseDokumentasjoner.totalElements !== 0 && (
            <Block
              display={'flex'}
              justifyContent={'space-between'}
              marginTop={theme.sizing.scale1000}
            >
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
        </>
      )}
    </Block>
  )
}

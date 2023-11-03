import { useParams } from 'react-router-dom'
import { Block, BlockProps } from 'baseui/block'
import { useEffect, useState } from 'react'
import { HeadingXLarge, LabelLarge, LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { codelist, ListName, LovCode, TemaCode } from '../services/Codelist'
import { ExternalLink, urlForObject } from '../components/common/RouteLink'
import { theme } from '../util'
import { Markdown } from '../components/common/Markdown'
import { ettlevColors } from '../util/theme'
import Button from '../components/common/Button'
import { KravFilters } from '../api/KravGraphQLApi'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { PanelLink, PanelLinkCard, PanelLinkCardOverrides } from '../components/common/PanelLink'
import { kravNumView } from './KravPage'
import * as _ from 'lodash'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { Page } from '../components/scaffold/Page'
import { SimpleTag } from '../components/common/SimpleTag'
import { Krav, KravQL, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { gql } from '@apollo/client/core'
import { useForceUpdate } from '../util/hooks'
import { margin } from '../components/common/Style'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { sortKraverByPriority } from '../util/sort'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { BodyLong, BodyShort, Heading, LinkPanel, Loader, Spacer, Tag } from '@navikt/ds-react'
import { lovdataBase } from '../components/Lov'

export const TemaPage = () => {
  const { tema } = useParams<{ tema: string }>()
  if (!tema) return <TemaListe />

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>
  return <TemaSide tema={code} />
}

export const getTemaMainHeader = (tema: TemaCode, lover: LovCode[], expand: boolean, setExpand: (e: boolean) => void, noExpandButton?: boolean, noHeader?: boolean) => {
  return (
    <>
      {!noHeader && (
        <>
          <Heading level="1" size="large" spacing>
            {tema.shortName}
          </Heading>
          <Helmet>
            <meta charSet="utf-8" />
            <title>{tema.shortName}</title>
          </Helmet>
        </>
      )}
      <Block
        minHeight={'125px'}
        maxHeight={expand ? undefined : '125px'}
        maxWidth={'750px'}
        overflow={'hidden'}
        $style={{
          maskImage: expand ? undefined : `linear-gradient(${ettlevColors.black} 40%, transparent)`,
        }}
      >
        <Markdown source={tema.description} p1 />
      </Block>

      {expand && (
        <Block marginBottom={theme.sizing.scale900}>
          <Heading className="mt-7" level="2" size="medium" spacing>
            Ansvarlig for lovtolkning
          </Heading>
          {_.uniq(lover.map((l) => l.data?.underavdeling)).map((code, index) => (
            <BodyShort key={code + '_' + index} size="large" spacing>
              {codelist.getCode(ListName.UNDERAVDELING, code)?.shortName}
            </BodyShort>
          ))}
          <Heading level="2" size="medium" spacing>
            Lovdata
          </Heading>
          {lover.map((l, index) => (
            <Block key={l.code + '_' + index} marginBottom={theme.sizing.scale200}>
              <ExternalLink href={lovdataBase(l.code)}>{l.shortName}</ExternalLink>
            </Block>
          ))}
        </Block>
      )}

      {!noExpandButton && (
        <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale600}>
          <Button onClick={() => setExpand(!expand)} icon={expand ? faChevronUp : faChevronDown} kind={'underline-hover'}>
            {expand ? 'Mindre' : 'Mer'} om tema
          </Button>
        </Block>
      )}
    </>
  )
}

const TemaSide = ({ tema }: { tema: TemaCode }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: lover.map((c) => c.code) }, { skip: !lover.length })
  const [expand, setExpand] = useState(false)
  const [kravList, setKravList] = useState<Krav[]>([])

  ampli.logEvent('sidevisning', { side: 'Tema side', sidetittel: tema.shortName })

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Forstå kravene',
      href: '/tema',
    },
  ]

  useEffect(() => {
    if (data && data.krav && data.krav.content && data.krav.content.length > 0) {
      ; (async () => {
        const allKravPriority = await getAllKravPriority()
        const kraver = _.cloneDeep(data.krav.content)
        kraver.map((k) => {
          const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
          k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
          return k
        })
        setKravList(sortKraverByPriority(kraver, tema.shortName))
      })()
    }
  }, [data])

  return (
    <Page
      breadcrumbPaths={breadcrumbPaths}
      currentPage={tema.shortName}
      headerBackgroundColor={ettlevColors.green100}
      backgroundColor={ettlevColors.grey25}
      headerOverlap={'125px'}
      header={getTemaMainHeader(tema, lover, expand, setExpand)}
    >
      <Block>
        <HeadingXLarge marginLeft="0px">{loading ? '?' : data?.krav.numberOfElements || 0} krav</HeadingXLarge>
        {loading && <SkeletonPanel count={10} />}
        {!loading &&
          kravList &&
          kravList.map((k, index) => (
            <Block key={k.kravNummer + '.' + k.kravVersjon + '_' + index} marginBottom={'8px'}>
              <PanelLink
                key={k.kravNummer + '.' + k.kravVersjon + '_' + index + '_panel'}
                useUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                beskrivelse={kravNumView(k)}
                title={<LabelLarge $style={{ fontSize: '18px' }}>{k.navn}</LabelLarge>}
                flip
              />
            </Block>
          ))}
      </Block>
    </Page>
  )
}

const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true,
}

const TemaListe = () => {
  const [num] = useState<{ [t: string]: number }>({})
  const update = useForceUpdate()

  ampli.logEvent('sidevisning', { side: 'Tema side' })

  const updateNum = (tema: string, temaNum: number) => {
    num[tema] = temaNum
    update()
  }

  const kravAntall = Object.values(num).reduce((p, c) => p + c, 0)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))

  return (
    <div className="w-full" role="main" id="content">
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-full max-w-7xl px-8">
          <div className="flex-1 justify-start flex">
            <CustomizedBreadcrumbs currentPage="Forstå kravene" />
          </div>
          <div>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Forstå kravene</title>
            </Helmet>
            <Heading size="medium">Forstå kravene</Heading>
            <BodyLong>
              Totalt {kravAntall} krav fordelt på {temaListe.length} temaer
            </BodyLong>
          </div>
          <div className="mt-6">
            {temaListe.map((tema) => (
              <TemaPanel key={tema.code} tema={tema} setNum={updateNum} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const cardWidth = '32%'
export const cardHeight = '220px'
export const cardMaxheight = '250px'
const headerBgOverlap = '47px'

export const TemaPanel = ({ tema, setNum }: { tema: TemaCode, setNum: (tema: string, num: number) => void }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: [...lover.map((l) => l.code)] }, { skip: !lover.length })
  const krav = data?.krav.content || []
  useEffect(() => setNum(tema.code, krav.length), [krav])

  if (loading) {
    return <Loader size="large" />
  }

  return (
    <LinkPanel className="mb-2" key={tema.code} href={'/tema/' + tema.code} >
      <div className="w-full flex items-center ">
        <div>
          <LinkPanel.Title className="flex">
            {tema.shortName}
          </LinkPanel.Title>
          <LinkPanel.Description className="lg:flex items-center gap-2">
            {lover.map((l, i) =>
              <div key={l.code} className="flex items-center gap-2">
                {l.shortName}
                {i < lover.length - 1 && <span className="hidden lg:block h-2 w-2 rotate-45 rounded-[1px] bg-red-200"></span>}
              </div>
            )}
          </LinkPanel.Description>
        </div>
        <Spacer />
        <Tag variant="info">{krav.length || 0} krav</Tag>
      </div>
    </LinkPanel>
  )
}

export const TemaCard = ({ tema, relevans, setNum }: { tema: TemaCode; relevans: string[]; setNum: (tema: string, num: number) => void }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: [...lover.map((l) => l.code)] }, { skip: !lover.length })
  const krav = data?.krav.content.filter((k) => !relevans.length || k.relevansFor.map((r) => r.code).some((r) => relevans.includes(r))) || []
  useEffect(() => setNum(tema.code, krav.length), [krav.length])

  const overrides: PanelLinkCardOverrides = {
    Root: {
      Block: {
        style: {
          maskImage: loading ? `linear-gradient(${ettlevColors.black} 0%, transparent 70% 100%)` : undefined,
        },
      },
    },
    Header: {
      Block: {
        style: {
          backgroundColor: ettlevColors.green100,
          minHeight: '110px',
          paddingBottom: theme.sizing.scale600,
        },
      },
    },
    Content: {
      Block: {
        style: {
          marginTop: `-${headerBgOverlap}`,
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden',
        },
      },
    },
  }

  return (
    <PanelLinkCard
      width={cardWidth}
      overrides={overrides}
      maxHeight={cardMaxheight}
      verticalMargin={theme.sizing.scale400}
      href={loading ? undefined : urlForObject(ListName.TEMA, tema.code)}
      tittel={tema.shortName + (loading ? ' - Laster...' : '')}
      ComplimentaryContent={
        <Block paddingLeft="16px" paddingBottom="16px">
          <LabelSmall $style={{ fontSize: '16px' }}>Krav og veiledning til</LabelSmall>
          {lover.map((l) => {
            return (
              <ParagraphXSmall $style={{ fontSize: '16px', lineHeight: '24px' }} marginTop="0px" marginBottom="0px" key={l.shortName}>
                {l.shortName}
              </ParagraphXSmall>
            )
          })}
        </Block>
      }
    >
      <Block display={'flex'} flexDirection={'column'} height={cardHeight}>
        <SimpleTag active>
          <Block display={'flex'} alignItems={'center'} justifyContent={'center'} {...margin('8px', '16px')}>
            {/* <img src={gavelIcon} width={'35px'} height={'35px'} aria-hidden alt={'Hammer ikon'} /> */}
            <LabelSmall color={ettlevColors.navOransje} $style={{ fontSize: '20px', lineHeight: '18px' }} marginRight="4px">
              {krav?.length || 0}
            </LabelSmall>
            <ParagraphXSmall $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>krav</ParagraphXSmall>
          </Block>
        </SimpleTag>

        <Markdown source={tema.data?.shortDesciption} />
      </Block>
    </PanelLinkCard>
  )
}

export const useKravCounter = (variables: { lover: string[] }, options?: QueryHookOptions<any, { lover?: string[] }>) => {
  return useQuery<{ krav: PageResponse<KravQL> }, KravFilters>(query, {
    ...(options || {}),
    variables,
  })
}

const query = gql`
  query countKrav($lover: [String!]) {
    krav(filter: { lover: $lover, gjeldendeKrav: true }) {
      numberOfElements
      content {
        id
        kravNummer
        kravVersjon
        navn
        relevansFor {
          code
        }
      }
    }
  }
`

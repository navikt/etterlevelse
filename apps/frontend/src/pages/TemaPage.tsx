import { useParams } from 'react-router-dom'
import { Block, BlockProps } from 'baseui/block'
import { useEffect, useState } from 'react'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { codelist, ListName, LovCode, TemaCode } from '../services/Codelist'
import { ExternalLink, urlForObject } from '../components/common/RouteLink'
import { theme } from '../util'
import { Markdown } from '../components/common/Markdown'
import { ettlevColors } from '../util/theme'
import { KravFilters } from '../api/KravGraphQLApi'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { PanelLinkCard, PanelLinkCardOverrides } from '../components/common/PanelLink'
import { kravNumView } from './KravPage'
import * as _ from 'lodash'
import { SimpleTag } from '../components/common/SimpleTag'
import { Krav, KravQL, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { gql } from '@apollo/client/core'
import { margin } from '../components/common/Style'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { sortKraverByPriority } from '../util/sort'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { ampli } from '../services/Amplitude'
import { BodyShort, Detail, Heading, Label, LinkPanel } from '@navikt/ds-react'
import { lovdataBase } from '../components/Lov'
import { user } from '../services/User'
import { PageLayout } from '../components/scaffold/Page'

export const TemaPage = () => {
  const { tema } = useParams<{ tema: string }>()

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>
  return <TemaView tema={code} />
}

export const getTemaMainHeader = (tema: TemaCode, lover: LovCode[], noHeader?: boolean) => {
  return (
    <div className="lg:grid lg:grid-flow-col lg:gap-2">
      <div>
        {!noHeader && (
          <Heading level="1" size="medium" spacing>
            {tema.shortName}
          </Heading>
        )}
        <Markdown source={tema.description} />
      </div>

      <div className="my-8 lg:border-l-2 lg:pl-2 lg:border-gray-200">
        <Heading level="2" size="small" spacing>
          Ansvarlig for lovtolkning
        </Heading>
        {_.uniq(lover.map((l) => l.data?.underavdeling)).map((code, index) => (
          <BodyShort key={code + '_' + index} size="large" spacing>
            {codelist.getCode(ListName.UNDERAVDELING, code)?.shortName}
          </BodyShort>
        ))}
        <Heading level="2" size="small" spacing>
          Lovdata
        </Heading>
        {lover.map((l, index) => (
          <div key={l.code + '_' + index} className="mb-1.5">
            <ExternalLink href={lovdataBase(l.code)}>{l.shortName}</ExternalLink>
          </div>
        ))}
      </div>
    </div>
  )
}

const TemaView = ({ tema }: { tema: TemaCode }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter({ lover: lover.map((c) => c.code) }, { skip: !lover.length })
  const [kravList, setKravList] = useState<Krav[]>([])

  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Tema side', sidetittel: tema.shortName, role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER' })
  }, [])

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
    <PageLayout pageTitle={tema.shortName} breadcrumbPaths={breadcrumbPaths} currentPage={tema.shortName}>
      {getTemaMainHeader(tema, lover)}
      <div className="mt-6">
        <Label>{loading ? '?' : data?.krav.numberOfElements || 0} krav</Label>
        {loading && <SkeletonPanel count={10} />}
        {!loading && kravList && (
          <div className="grid gap-2 lg:grid-cols-2">
            {kravList.map((k, index) => (
              <LinkPanel href={`/krav/${k.kravNummer}/${k.kravVersjon}`} key={k.kravNummer + '.' + k.kravVersjon + '_' + index}>
                <Detail weight="semibold">{kravNumView(k)}</Detail>
                <BodyShort>{k.navn}</BodyShort>
              </LinkPanel>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export const cardWidth = '32%'
export const cardHeight = '220px'
export const cardMaxheight = '250px'
const headerBgOverlap = '47px'


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

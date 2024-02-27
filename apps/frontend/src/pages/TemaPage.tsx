import { BodyShort, Detail, Heading, Label, LinkPanel } from '@navikt/ds-react'
import { Block } from 'baseui/block'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import * as _ from 'lodash'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { lovdataBase } from '../components/Lov'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { Markdown } from '../components/common/Markdown'
import { PanelLinkCard, TPanelLinkCardOverrides } from '../components/common/PanelLink'
import { ExternalLink, urlForObject } from '../components/common/RouteLink'
import { SimpleTag } from '../components/common/SimpleTag'
import { margin } from '../components/common/Style'
import { PageLayout } from '../components/scaffold/Page'
import { IKrav } from '../constants'
import { useKravCounter } from '../query/KravQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, TLovCode, TTemaCode, codelist } from '../services/Codelist'
import { theme } from '../util'
import { sortKraverByPriority } from '../util/sort'
import { ettlevColors } from '../util/theme'
import { kravNumView } from './KravPage'
import { temaBreadCrumbPath } from './util/BreadCrumbPath'

export const TemaPage = () => {
  const { tema } = useParams<{ tema: string }>()

  const code = codelist.getCode(EListName.TEMA, tema)
  if (!code) return <>`&apos;`invalid code`&apos;`</>
  return <TemaView tema={code} />
}

export const getTemaMainHeader = (tema: TTemaCode, lover: TLovCode[], noHeader?: boolean) => {
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
            {codelist.getCode(EListName.UNDERAVDELING, code)?.shortName}
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

const TemaView = ({ tema }: { tema: TTemaCode }) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter(
    { lover: lover.map((c) => c.code) },
    { skip: !lover.length }
  )
  const [kravList, setKravList] = useState<IKrav[]>([])

  useEffect(() => {
    ampli.logEvent('sidevisning', {
      side: 'Tema side',
      sidetittel: tema.shortName,
      ...userRoleEventProp,
    })
  }, [])

  useEffect(() => {
    if (data && data.krav && data.krav.content && data.krav.content.length > 0) {
      ;(async () => {
        const allKravPriority = await getAllKravPriority()
        const kraver = _.cloneDeep(data.krav.content)
        kraver.map((k) => {
          const priority = allKravPriority.filter(
            (kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon
          )
          k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
          return k
        })
        setKravList(sortKraverByPriority(kraver, tema.shortName))
      })()
    }
  }, [data])

  return (
    <PageLayout
      pageTitle={tema.shortName}
      breadcrumbPaths={[temaBreadCrumbPath]}
      currentPage={tema.shortName}
    >
      {getTemaMainHeader(tema, lover)}
      <div className="mt-6">
        <Label>{loading ? '?' : data?.krav.numberOfElements || 0} krav</Label>
        {loading && <SkeletonPanel count={10} />}
        {!loading && kravList && (
          <div className="grid gap-2 ">
            {kravList.map((k, index) => (
              <LinkPanel
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                key={k.kravNummer + '.' + k.kravVersjon + '_' + index}
              >
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

export const TemaCard = ({
  tema,
  relevans,
  setNum,
}: {
  tema: TTemaCode
  relevans: string[]
  setNum: (tema: string, num: number) => void
}) => {
  const lover = codelist.getCodesForTema(tema.code)
  const { data, loading } = useKravCounter(
    { lover: [...lover.map((l) => l.code)] },
    { skip: !lover.length }
  )
  const krav =
    data?.krav.content.filter(
      (k) => !relevans.length || k.relevansFor.map((r) => r.code).some((r) => relevans.includes(r))
    ) || []
  useEffect(() => setNum(tema.code, krav.length), [krav.length])

  const overrides: TPanelLinkCardOverrides = {
    Root: {
      Block: {
        style: {
          maskImage: loading
            ? `linear-gradient(${ettlevColors.black} 0%, transparent 70% 100%)`
            : undefined,
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
      href={loading ? undefined : urlForObject(EListName.TEMA, tema.code)}
      tittel={tema.shortName + (loading ? ' - Laster...' : '')}
      ComplimentaryContent={
        <Block paddingLeft="16px" paddingBottom="16px">
          <LabelSmall $style={{ fontSize: '16px' }}>Krav og veiledning til</LabelSmall>
          {lover.map((l) => {
            return (
              <ParagraphXSmall
                $style={{ fontSize: '16px', lineHeight: '24px' }}
                marginTop="0px"
                marginBottom="0px"
                key={l.shortName}
              >
                {l.shortName}
              </ParagraphXSmall>
            )
          })}
        </Block>
      }
    >
      <Block display={'flex'} flexDirection={'column'} height={cardHeight}>
        <SimpleTag active>
          <Block
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            {...margin('8px', '16px')}
          >
            {/* <img src={gavelIcon} width={'35px'} height={'35px'} aria-hidden alt={'Hammer ikon'} /> */}
            <LabelSmall
              color={ettlevColors.navOransje}
              $style={{ fontSize: '20px', lineHeight: '18px' }}
              marginRight="4px"
            >
              {krav?.length || 0}
            </LabelSmall>
            <ParagraphXSmall $style={{ lineHeight: '18px', marginTop: '0px', marginBottom: '0px' }}>
              krav
            </ParagraphXSmall>
          </Block>
        </SimpleTag>

        <Markdown source={tema.data?.shortDesciption} />
      </Block>
    </PanelLinkCard>
  )
}

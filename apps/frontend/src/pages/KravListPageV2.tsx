import { Block, Responsive, Scale } from 'baseui/block'
import { H2, HeadingXXLarge, Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { useState } from 'react'
import Button from '../components/common/Button'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import CustomizedTabs from '../components/common/CustomizedTabs'
import RouteLink from '../components/common/RouteLink'
import { user } from '../services/User'
import { theme } from '../util'
import moment from 'moment'
import { ettlevColors, maxPageWidth } from '../util/theme'
import { plusIcon } from '../components/Images'
import { useKravFilter } from '../api/KravGraphQLApi'
import { PanelLink } from '../components/common/PanelLink'
import { Spinner } from '../components/common/Spinner'
import { Notification } from 'baseui/notification'
import { KravQL, KravStatus } from '../constants'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { kravStatus } from '../pages/KravPage'
import { codelist, ListName } from '../services/Codelist'
import { Card } from 'baseui/card'
import { borderColor, borderRadius, borderStyle, borderWidth, margin, marginAll } from '../components/common/Style'

type Section = 'siste' | 'alle'

const tabMarginBottom = '10px'

export const sortKrav = (kravene: KravQL[]) => {
  return [...kravene].sort((a, b) => {
    if (a.kravNummer === b.kravNummer) {
      return b.kravVersjon - a.kravVersjon
    } else {
      return a.kravNummer - b.kravNummer
    }
  })
}

const responsivePadding: Responsive<Scale> = ['16px', '16px', '16px', '100px', '100px', '100px']

export const KravListPage = () => (
  <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
    <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={responsivePadding} paddingRight={responsivePadding} paddingTop={theme.sizing.scale800}>
          <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
          <Block display="flex" >
            <Block flex="1">
              <HeadingXXLarge marginTop='0' >Forvalte og opprette krav</HeadingXXLarge>
            </Block>

            <Block display="flex" justifyContent="flex-end">
              {user.isKraveier() && (
                <RouteLink hideUnderline href={'/krav/ny'}>
                  <Button startEnhancer={<img src={plusIcon} alt="" />} size="compact">Nytt krav</Button>
                </RouteLink>
              )}
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>

    <Block
      display={'flex'}
      justifyContent="center"
      width="100%"
      $style={{
        background: `linear-gradient(top, ${ettlevColors.grey50} 80px, ${ettlevColors.grey25} 0%)`,
      }}
    >
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={responsivePadding} paddingRight={responsivePadding} paddingTop={theme.sizing.scale800}>
          <KravTabs />
        </Block>
      </Block>
    </Block>
  </Block>
)

const KravStatusView = ({ status }: { status: KravStatus }) => {
  const getStatusDisplay = (background: string, border: string) => (
    <Block width='fit-content'>
      <Card
        overrides={{
          Contents: {
            style: {
              ...marginAll('0px')
            },
          },
          Body: {
            style: {
              ...margin('2px', '8px')
            },
          },
          Root: {
            style: {
              // Did not use border, margin and border radius to remove warnings.
              backgroundColor: background,
              ...borderColor(border),
              ...borderWidth('1px'),
              ...borderStyle('solid'),
              ...borderRadius('4px'),
            },
          },
        }}
      >
        <Paragraph4 $style={{ color: ettlevColors.navMorkGra, ...marginAll('0px') }}>{kravStatus(status)}</Paragraph4>
      </Card>
    </Block>
  )

  if (status === KravStatus.UTKAST) {
    return getStatusDisplay('#FFECCC', '#D47B00')
  } else if (status === KravStatus.AKTIV) {
    return getStatusDisplay(ettlevColors.green50, ettlevColors.green400)
  } else if (status === KravStatus.UTGAATT) {
    return getStatusDisplay(ettlevColors.grey50, ettlevColors.grey200)
  } else {
    return getStatusDisplay('#FFECCC', '#D47B00')
  }
}

const KravPanels = ({ kravene, loading }: { kravene: KravQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block marginBottom={tabMarginBottom}>
      {kravene.map((k) => {
        const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
        const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)

        return (
          <Block key={k.id} marginBottom={'0px'}>
            <PanelLink
              useUnderline
              href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
              title={<Paragraph2 $style={{ fontSize: '16px', marginBottom: '0px', marginTop: '0px' }}>K{k.kravNummer}.{k.kravVersjon}</Paragraph2>}
              beskrivelse={<Label3 $style={{ fontSize: '22px', lineHeight: '28px' }}>{k.navn}</Label3>}
              rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
              rightTitle={tema && tema.shortName ? tema.shortName : ''}
              statusText={<KravStatusView status={k.status} />}
            />
          </Block>
        )
      })}
    </Block>
  )
}

const KravTabs = () => {
  const [tab, setTab] = useState<Section>('siste')

  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => setTab(args.activeKey as Section)}
      tabs={[
        {
          key: 'siste',
          title: 'Sist endret av meg',
          content: <SistRedigertKrav />,
        },
        {
          key: 'alle',
          title: 'Seksjonens krav',
          content: 'Seksjonens krav',
        }
      ]}
    />
  )
}

const SistRedigertKrav = () => {
  const res = useKravFilter({
    sistRedigert: 10,
    gjeldendeKrav: false,
    pageNumber: 0,
    pageSize: 10,
  })

  const { variables, data, loading, error } = res

  const sortedData = sortKrav(data?.krav.content || [])

  return loading && !data?.krav?.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block>
        <H2>{sortedData.length ? sortedData.length : 0} Krav</H2>
      </Block>
      <KravPanels kravene={sortedData} loading={loading} />
    </Block>
  )
}
import { Block } from 'baseui/block'
import { H2, HeadingXXLarge } from 'baseui/typography'
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

type Section = 'siste' | 'alle'

const tabMarginBottom = '10px'

export const getKravStatus = (status?: KravStatus) => {
  if (!status) return ''
  switch (status) {
    case KravStatus.AKTIV:
      return 'Aktiv'
    case KravStatus.UNDER_ARBEID:
      return 'Under arbeid'
    case KravStatus.UTGAATT:
      return 'Utgått'
    case KravStatus.UTKAST:
      return 'Utkast'
    default:
      return status
  }
}

export const KravListPage = () => (
  <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
    <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
      <Block maxWidth={maxPageWidth} width="100%">
        <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
          <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
          <HeadingXXLarge marginTop='0' >Forvalte og opprette krav</HeadingXXLarge>
        </Block>
        <Block paddingLeft={'100px'} paddingRight={'100px'} display="flex" justifyContent="flex-end">
          {user.isKraveier() && (
            <RouteLink hideUnderline href={'/krav/ny'}>
              <Button startEnhancer={<img src={plusIcon} alt="" />} size="compact">Nytt krav</Button>
            </RouteLink>
          )}
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
        <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
          <KravTabs />
        </Block>
      </Block>
    </Block>
  </Block>
)

const KravPanels = ({ kravene, loading }: { kravene: KravQL[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block marginBottom={tabMarginBottom}>
      {kravene.map((k) => (
        <Block key={k.id} marginBottom={'0px'}>
          <PanelLink
            useUnderline
            href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
            title={`K${k.kravNummer}.${k.kravVersjon}`}
            beskrivelse={`${k.navn}`}
            rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
          />
        </Block>
      ))}
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

  return loading && !data?.krav?.numberOfElements ? (
    <Spinner size={theme.sizing.scale2400} />
  ) : error ? (
    <Notification kind={'negative'}>{JSON.stringify(error, null, 2)}</Notification>
  ) : (
    <Block>
      <Block>
        <H2>{data?.krav.content && data?.krav.content.length ? data?.krav.content.length : 0} Krav</H2>
      </Block>
      <KravPanels kravene={data?.krav?.content || []} loading={loading}/>
    </Block>
  )
}
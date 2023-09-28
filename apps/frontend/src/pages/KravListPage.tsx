import { Block } from 'baseui/block'
import { HeadingXXLarge, LabelSmall, ParagraphMedium } from 'baseui/typography'
import { useEffect, useState } from 'react'
import Button from '../components/common/Button'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import CustomizedTabs from '../components/common/CustomizedTabs'
import RouteLink from '../components/common/RouteLink'
import { user } from '../services/User'
import { theme } from '../util'
import moment from 'moment'
import { ettlevColors, maxPageWidth, responsivePaddingLarge } from '../util/theme'
import { plusIcon } from '../components/Images'
import { PanelLink } from '../components/common/PanelLink'
import { Krav, KravQL } from '../constants'
import { SkeletonPanel } from '../components/common/LoadingSkeleton'
import { codelist, ListName } from '../services/Codelist'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../components/common/Style'
import { AllKrav } from '../components/kravList/AllKrav'
import { SistRedigertKrav } from '../components/kravList/SisteRedigertKrav'
import { TemaList } from '../components/kravList/TemaList'
import StatusView from '../components/common/StatusTag'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'

type Section = 'siste' | 'alle' | 'tema'

const tabMarginBottom = '10px'

export const sortKrav = (kravene: KravQL[]) => {
  return [...kravene].sort((a, b) => {
    if (a.navn.toLocaleLowerCase() === b.navn.toLocaleLowerCase()) {
      return b.kravVersjon - a.kravVersjon
    }
    if (a.navn.toLocaleLowerCase() < b.navn.toLocaleLowerCase()) return -1
    if (a.navn.toLocaleLowerCase() > b.navn.toLocaleLowerCase()) return 1
    return 0
  })
}

export const KravListPage = () => {
  ampli.logEvent('sidevisning', { side: 'Kraveier side', sidetittel: 'Forvalte og opprette krav' })

  return (
    <Block width="100%" paddingBottom={'200px'} id="content" overrides={{ Block: { props: { role: 'main' } } }}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Forvalte og opprette krav</title>
      </Helmet>
      <Block width="100%" backgroundColor={ettlevColors.grey50} display={'flex'} justifyContent={'center'}>
        <Block maxWidth={maxPageWidth} width="100%">
          <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingTop={theme.sizing.scale800}>
            <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
            <Block display="flex">
              <Block flex="1">
                <HeadingXXLarge marginTop="0">Forvalte og opprette krav</HeadingXXLarge>
              </Block>

              <Block display="flex" justifyContent="flex-end">
                {user.isKraveier() && (
                  <RouteLink hideUnderline href={'/krav/ny'}>
                    <Button startEnhancer={<img src={plusIcon} alt="plus icon" />} size="compact">
                      Nytt krav
                    </Button>
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
          <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingTop={theme.sizing.scale800}>
            <KravTabs />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

export const KravPanels = ({ kravene, loading }: { kravene?: KravQL[] | Krav[]; loading?: boolean }) => {
  if (loading) return <SkeletonPanel count={5} />
  return (
    <Block
      marginBottom={tabMarginBottom}
      $style={{
        ...borderWidth('1px'),
        ...borderColor(ettlevColors.grey100),
        ...borderStyle('solid'),
        ...borderRadius('4px'),
        backgroundColor: 'white',
      }}
    >
      {kravene &&
        kravene.map((k, index) => {
          const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
          const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
          return (
            <Block key={k.id} marginBottom={'0px'}>
              {index !== 0 && (
                <Block width="100%" display="flex" justifyContent="center">
                  <Block display="flex" width="98%" height="1px" backgroundColor={ettlevColors.grey100} />
                </Block>
              )}
              <PanelLink
                useDescriptionUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                title={
                  <ParagraphMedium $style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px', lineHeight: '15px' }}>
                    K{k.kravNummer}.{k.kravVersjon}
                  </ParagraphMedium>
                }
                beskrivelse={<LabelSmall $style={{ fontSize: '18px', fontWeight: 600 }}>{k.navn}</LabelSmall>}
                rightBeskrivelse={!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}
                rightTitle={tema && tema.shortName ? tema.shortName : ''}
                statusText={<StatusView status={k.status} />}
                overrides={{
                  Block: {
                    style: {
                      ':hover': { boxShadow: 'none' },
                      ...borderStyle('hidden'),
                    },
                  },
                }}
              />
            </Block>
          )
        })}
    </Block>
  )
}

const KravTabs = () => {
  const params = useParams<{ tab?: Section }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Section>(params.tab || 'siste')

  useEffect(() => {
    setTab((params.tab as Section) || 'siste')
  }, [params])

  return (
    <CustomizedTabs
      fontColor={ettlevColors.green800}
      small
      backgroundColor={ettlevColors.grey25}
      activeKey={tab}
      onChange={(args) => {
        setTab(args.activeKey as Section)
        navigate(`/kravliste/${args.activeKey}`)
      }}
      tabs={[
        {
          key: 'siste',
          title: 'Sist endret av meg',
          content: <SistRedigertKrav />,
        },
        {
          key: 'tema',
          title: 'Tema',
          content: <TemaList />,
        },
        {
          key: 'alle',
          title: 'Alle krav',
          content: <AllKrav />,
        },
      ]}
    />
  )
}

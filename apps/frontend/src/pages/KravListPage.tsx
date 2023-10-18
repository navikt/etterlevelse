import {useEffect, useState} from 'react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import CustomizedTabs from '../components/common/CustomizedTabs'
import RouteLink from '../components/common/RouteLink'
import {user} from '../services/User'
import moment from 'moment'
import {ettlevColors} from '../util/theme'
import {Krav, KravQL} from '../constants'
import {codelist, ListName} from '../services/Codelist'
import {AllKrav} from '../components/kravList/AllKrav'
import {SistRedigertKrav} from '../components/kravList/SisteRedigertKrav'
import {TemaList} from '../components/kravList/TemaList'
import StatusView from '../components/common/StatusTag'
import {useNavigate, useParams} from 'react-router-dom'
import {Helmet} from 'react-helmet'
import {ampli} from '../services/Amplitude'
import {BodyLong, BodyShort, Button, Heading, Label, LinkPanel, Skeleton} from "@navikt/ds-react";
import {PlusIcon} from "@navikt/aksel-icons";

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
  ampli.logEvent('sidevisning', {side: 'Kraveier side', sidetittel: 'Forvalte og opprette krav'})

  return (
    <div className={"w-full pb-52"} id="content">
      <Helmet>
        <meta charSet="utf-8"/>
        <title>Forvalte og opprette krav</title>
      </Helmet>
      <div className={"w-full flex justify-center"}>
        <div className={"w-full max-w-7xl"}>
          <div className={"pt-6"}>
            <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav"/>
            <div className={"flex"}>
              <div className={"flex-1"}>
                <Heading className={"mt-0"} size="xlarge">Forvalte og opprette krav</Heading>
              </div>

              <div className={"flex justify-end"}>
                {user.isKraveier() && (
                  <RouteLink hideUnderline href={'/krav/ny'}>
                    <Button iconPosition={"left"} icon={<PlusIcon/>} size={"medium"}>
                      Nytt krav
                    </Button>
                  </RouteLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={"flex justify-center w-full"}>
        <div className={"w-full max-w-7xl"}>
          <div className={"pt-6"}>
            <KravTabs/>
          </div>
        </div>
      </div>
    </div>
  )
}

export const KravPanels = ({kravene, loading}: { kravene?: KravQL[] | Krav[]; loading?: boolean }) => {
  if (loading) return <Skeleton variant={"rectangle"}/>
  return (
    <div className={"mb-2.5"}>
      {kravene &&
        kravene.map((k, index) => {
          const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
          const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
          return (
            <div className={"mb-0"} key={k.id}>
              {index !== 0 && (
                <div className={"w-full flex justify-center"}>
                  <div className={"flex w-11/12 h-px"}/>
                </div>
              )}
              <LinkPanel
                //useDescriptionUnderline
                href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                /*beskrivelse={<Label>{k.navn}</Label>}
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
                }}*/

              >
                <LinkPanel.Title className={"flex justify-between bg-blue-400"}>
                  <div className={"flex justify-between"}>
                    <div>
                      <BodyShort size={"small"}>
                        K{k.kravNummer}.{k.kravVersjon}
                      </BodyShort>
                      <BodyLong><Label>{k.navn}</Label></BodyLong>
                    </div>
                    <div>
                      <StatusView status={k.status}/>
                    </div>
                    <div className={"justify-items-end"}>
                      <BodyShort size={"medium"}>{tema && tema.shortName ? tema.shortName : ''}</BodyShort>
                      <BodyShort size={"small"}>{!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}</BodyShort>
                    </div>
                  </div>
                </LinkPanel.Title>
              </LinkPanel>
            </div>
          )
        })}
    </div>
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
          content: <SistRedigertKrav/>,
        },
        {
          key: 'tema',
          title: 'Tema',
          content: <TemaList/>,
        },
        {
          key: 'alle',
          title: 'Alle krav',
          content: <AllKrav/>,
        },
      ]}
    />
  )
}

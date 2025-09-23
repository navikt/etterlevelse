import { PlusIcon } from '@navikt/aksel-icons'
import { Button, List, Skeleton, Tabs } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { ListLayout } from '../components/common/ListLayout'
import { kravUrl, kravlisteOpprettUrl, kravlisteUrl } from '../components/common/RouteLinkKrav'
import StatusView from '../components/common/StatusTag'
import { AllKrav } from '../components/kravList/AllKrav'
import { SistRedigertKrav } from '../components/kravList/SisteRedigertKrav'
import { TemaList } from '../components/kravList/TemaList'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { IKrav, TKravQL } from '../constants'
import { CodelistService, EListName, TLovCode, TTemaCode } from '../services/Codelist'
import { user } from '../services/User'

type TSection = 'siste' | 'alle' | 'tema'

export const sortKrav = (kravene: TKravQL[]): TKravQL[] => {
  return [...kravene].sort((a: TKravQL, b: TKravQL) => {
    if (a.navn.toLocaleLowerCase() === b.navn.toLocaleLowerCase()) {
      return b.kravVersjon - a.kravVersjon
    }
    if (a.navn.toLocaleLowerCase() < b.navn.toLocaleLowerCase()) return -1
    if (a.navn.toLocaleLowerCase() > b.navn.toLocaleLowerCase()) return 1
    return 0
  })
}

export const KravListPage = () => {
  // ampli.logEvent('sidevisning', {
  //   side: 'Kraveier side',
  //   sidetittel: 'Forvalte og opprette krav',
  //   ...userRoleEventProp,
  // })

  return (
    <PageLayout pageTitle='Forvalte og opprette krav' currentPage='Forvalte og opprette krav'>
      <div className='pb-52 w-full'>
        <ListPageHeader headingText='Forvalte og opprette krav'>
          {user.isKraveier() && (
            <Button
              iconPosition='left'
              icon={<PlusIcon area-label='' aria-hidden />}
              size='medium'
              as='a'
              href={kravlisteOpprettUrl()}
            >
              Nytt krav
            </Button>
          )}
        </ListPageHeader>

        <div className='flex justify-center w-full'>
          <div className='w-full'>
            <div className='pt-6'>
              <KravTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

interface IKravPanelsProps {
  kravene?: TKravQL[] | IKrav[]
  loading?: boolean
}

export const KravPanels = ({ kravene, loading }: IKravPanelsProps) => {
  const [codelistUtils] = CodelistService()

  return (
    <>
      {loading && <Skeleton variant='rectangle' />}
      {!loading && (
        <List className='mb-2.5 flex flex-col gap-2'>
          {kravene &&
            kravene.map((krav: IKrav | TKravQL) => {
              const lov: TLovCode = codelistUtils.getCode(
                EListName.LOV,
                krav.regelverk[0]?.lov?.code
              ) as TLovCode
              const tema: TTemaCode = codelistUtils.getCode(
                EListName.TEMA,
                lov?.data?.tema
              ) as TTemaCode

              return (
                <ListLayout
                  key={krav.id}
                  id={krav.id}
                  url={`${kravUrl}/${krav.kravNummer}/${krav.kravVersjon}`}
                  documentNumber={`K${krav.kravNummer}.${krav.kravVersjon}`}
                  title={krav.navn}
                  status={<StatusView status={krav.status} />}
                  upperRightField={tema && tema.shortName ? tema.shortName : ''}
                  changeStamp={
                    krav.changeStamp.lastModifiedDate !== undefined &&
                    krav.changeStamp.lastModifiedDate !== ''
                      ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('LL')}`
                      : ''
                  }
                />
              )
            })}
        </List>
      )}
    </>
  )
}

const KravTabs = () => {
  const navigate: NavigateFunction = useNavigate()
  const params: Readonly<
    Partial<{
      tab?: string
    }>
  > = useParams<{ tab?: string }>()
  const [tab, setTab] = useState<string>(params.tab || 'siste')

  useEffect(() => {
    setTab((params.tab as TSection) || 'siste')
  }, [params])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(tabQuery: string) => {
        setTab(tabQuery)
        navigate(kravlisteUrl(tabQuery))
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='siste' label='Sist endret av meg' />
        <Tabs.Tab value='tema' label='Endre rekkefølge på krav (Temaoversikt)' />
        <Tabs.Tab value='alle' label='Alle krav' />
      </Tabs.List>
      <Tabs.Panel value='siste'>
        <SistRedigertKrav />
      </Tabs.Panel>
      <Tabs.Panel value='tema'>
        <TemaList />
      </Tabs.Panel>
      <Tabs.Panel value='alle'>
        <AllKrav />
      </Tabs.Panel>
    </Tabs>
  )
}

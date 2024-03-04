import { PlusIcon } from '@navikt/aksel-icons'
import {
  BodyLong,
  BodyShort,
  Button,
  Label,
  LinkPanel,
  Skeleton,
  Spacer,
  Tabs,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusView from '../components/common/StatusTag'
import { AllKrav } from '../components/kravList/AllKrav'
import { SistRedigertKrav } from '../components/kravList/SisteRedigertKrav'
import { TemaList } from '../components/kravList/TemaList'
import { ListPageHeader } from '../components/scaffold/ListPageHeader'
import { PageLayout } from '../components/scaffold/Page'
import { IKrav, TKravQL } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { EListName, codelist } from '../services/Codelist'
import { user } from '../services/User'

type TSection = 'siste' | 'alle' | 'tema'

export const sortKrav = (kravene: TKravQL[]) => {
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
  ampli.logEvent('sidevisning', {
    side: 'Kraveier side',
    sidetittel: 'Forvalte og opprette krav',
    ...userRoleEventProp,
  })

  return (
    <PageLayout pageTitle="Forvalte og opprette krav" currentPage="Forvalte og opprette krav">
      <div className="pb-52 w-full">
        <ListPageHeader headingText="Forvalte og opprette krav">
          {user.isKraveier() && (
            <Button
              iconPosition="left"
              icon={<PlusIcon area-label="" aria-hidden />}
              size="medium"
              as="a"
              href="/kravliste/opprett"
            >
              Nytt krav
            </Button>
          )}
        </ListPageHeader>

        <div className="flex justify-center w-full">
          <div className="w-full">
            <div className="pt-6">
              <KravTabs />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export const KravPanels = ({
  kravene,
  loading,
}: {
  kravene?: TKravQL[] | IKrav[]
  loading?: boolean
}) => {
  if (loading) return <Skeleton variant="rectangle" />
  return (
    <div className="mb-2.5 flex flex-col gap-2">
      {kravene &&
        kravene.map((krav) => {
          const lov = codelist.getCode(EListName.LOV, krav.regelverk[0]?.lov?.code)
          const tema = codelist.getCode(EListName.TEMA, lov?.data?.tema)
          return (
            <div className="mb-0" key={krav.id}>
              <LinkPanel href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`}>
                <LinkPanel.Title className="flex items-center">
                  <div className="max-w-xl">
                    <BodyShort size="small">
                      K{krav.kravNummer}.{krav.kravVersjon}
                    </BodyShort>
                    <BodyLong>
                      <Label>{krav.navn}</Label>
                    </BodyLong>
                  </div>
                  <Spacer />
                  <div className="mr-5">
                    <StatusView status={krav.status} />
                  </div>
                  <div className="w-44">
                    <BodyShort size="small" className="break-words">
                      {tema && tema.shortName ? tema.shortName : ''}
                    </BodyShort>
                    <BodyShort size="small">
                      {krav.changeStamp.lastModifiedDate !== undefined &&
                      krav.changeStamp.lastModifiedDate !== ''
                        ? `Sist endret: ${moment(krav.changeStamp.lastModifiedDate).format('ll')}`
                        : ''}
                    </BodyShort>
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
  const params = useParams<{ tab?: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<string>(params.tab || 'siste')

  useEffect(() => {
    setTab((params.tab as TSection) || 'siste')
  }, [params])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(args) => {
        setTab(args)
        navigate(`/kravliste/${args}`)
      }}
    >
      <Tabs.List>
        <Tabs.Tab value="siste" label="Sist endret av meg" />
        <Tabs.Tab value="tema" label="Endre rekkefølge på krav (Temaoversikt)" />
        <Tabs.Tab value="alle" label="Alle krav" />
      </Tabs.List>
      <Tabs.Panel value="siste">
        <SistRedigertKrav />
      </Tabs.Panel>
      <Tabs.Panel value="tema">
        <TemaList />
      </Tabs.Panel>
      <Tabs.Panel value="alle">
        <AllKrav />
      </Tabs.Panel>
    </Tabs>
  )
}

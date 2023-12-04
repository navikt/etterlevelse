import { useEffect, useState } from 'react'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { useUser } from '../services/User'
import moment from 'moment'
import { Krav, KravQL } from '../constants'
import { codelist, ListName } from '../services/Codelist'
import { AllKrav } from '../components/kravList/AllKrav'
import { SistRedigertKrav } from '../components/kravList/SisteRedigertKrav'
import { TemaList } from '../components/kravList/TemaList'
import StatusView from '../components/common/StatusTag'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { BodyLong, BodyShort, Button, Heading, Label, LinkPanel, Skeleton, Spacer, Tabs } from '@navikt/ds-react'
import { PlusIcon } from '@navikt/aksel-icons'

type Section = 'siste' | 'alle' | 'tema'

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
  const user = useUser
  ampli.logEvent('sidevisning', { side: 'Kraveier side', sidetittel: 'Forvalte og opprette krav' })

  return (
    <div className="w-full pb-52" id="content" role="main">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Forvalte og opprette krav</title>
      </Helmet>
      <div className="w-full flex justify-center">
        <div className="w-full">
          <div>
            <CustomizedBreadcrumbs currentPage="Forvalte og opprette krav" />
            <div className="flex">
              <div className="flex-1">
                <Heading size="medium">Forvalte og opprette krav</Heading>
              </div>

              <div className="flex justify-end">
                {user.isKraveier() && (
                  <Button iconPosition="left" icon={<PlusIcon area-label="" aria-hidden />} size="medium" as="a" href="/krav/ny">
                    Nytt krav
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="w-full">
          <div className="pt-6">
            <KravTabs />
          </div>
        </div>
      </div>
    </div>
  )
}

export const KravPanels = ({ kravene, loading }: { kravene?: KravQL[] | Krav[]; loading?: boolean }) => {
  if (loading) return <Skeleton variant="rectangle" />
  return (
    <div className="mb-2.5 flex flex-col gap-2">
      {kravene &&
        kravene.map((k, index) => {
          const lov = codelist.getCode(ListName.LOV, k.regelverk[0]?.lov?.code)
          const tema = codelist.getCode(ListName.TEMA, lov?.data?.tema)
          return (
            <div className="mb-0" key={k.id}>
              <LinkPanel href={`/krav/${k.kravNummer}/${k.kravVersjon}`}>
                <LinkPanel.Title className="flex items-center">
                  <div className="max-w-xl">
                    <BodyShort size="small">
                      K{k.kravNummer}.{k.kravVersjon}
                    </BodyShort>
                    <BodyLong>
                      <Label>{k.navn}</Label>
                    </BodyLong>
                  </div>
                  <Spacer />
                  <div className="mr-5">
                    <StatusView status={k.status} />
                  </div>
                  <div className="w-44">
                    <BodyShort size="small" className="break-words">
                      {tema && tema.shortName ? tema.shortName : ''}
                    </BodyShort>
                    <BodyShort size="small">{!!k.changeStamp.lastModifiedDate ? `Sist endret: ${moment(k.changeStamp.lastModifiedDate).format('ll')}` : ''}</BodyShort>
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
    setTab((params.tab as Section) || 'siste')
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
        <Tabs.Tab value="tema" label="Juster krav rekkefølge" />
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

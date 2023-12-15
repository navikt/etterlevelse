import { useQuery } from '@apollo/client'
import { Button, Heading, Link, LinkPanel } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { getMeldingByType } from '../api/MeldingApi'
import { Markdown } from '../components/common/Markdown'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { PageLayout } from '../components/scaffold/Page'
import { AlertType, EtterlevelseDokumentasjonQL, Melding, MeldingStatus, MeldingType, PageResponse } from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { user } from '../services/User'
import { Variables, query } from './MyEtterlevelseDokumentasjonerPage'

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<Melding>()

  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<{ etterlevelseDokumentasjoner: PageResponse<EtterlevelseDokumentasjonQL> }, Variables>(query, {
    variables: { sistRedigert: 4 },
    skip: !user.isLoggedIn(),
  })

  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Hovedside', ...userRoleEventProp })
    ;(async () => {
      await getMeldingByType(MeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  return (
    <PageLayout noPadding fullWidth>
      <div className="bg-blue-50 py-10 flex justify-center">
        <div className="max-w-7xl w-full px-2">
          <div className="flex flex-col">
            <Heading className="flex justify-center" size="large" level="1">
              Etterlevelse i NAV
            </Heading>
            <span className="flex justify-center">Forstå og dokumentér</span>
          </div>
          {!etterlevelseDokumentasjonLoading && (
            <div className="bg-white mt-8 p-8 shadow-md shadow-slate-900 shadow-[#00000040]">
              {!data?.etterlevelseDokumentasjoner.content.length && (
                <div>
                  <Heading size="medium" level="2">
                    Etterlevelse i NAV
                  </Heading>
                  <span>
                    For å dokumentere etterlevelse må du opprette et etterlevelsesdokument. Du vil da se hvilke krav som gjelder for din løsning og kan dokumentere hvordan
                    løsningen etterlever kravene.
                  </span>
                </div>
              )}
              {data?.etterlevelseDokumentasjoner.content.length && <EtterlevelseDokumentasjonList etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content} />}
              <div className="mt-8 flex justify-end">
                <div className="mr-4">
                  <EditEtterlevelseDokumentasjonModal variant={data?.etterlevelseDokumentasjoner.content.length ? 'secondary' : 'primary'} />
                </div>
                <Link href="/dokumentasjoner">
                  <Button as="a" variant="tertiary">
                    Alle etterlevelsesdokumenter
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center w-full bg-no-repeat bg-contain xl:bg-cover bg-[left_4.5rem] bg-[url('/src/resources/icons/main-page-background-icon.svg')]">
        <div className="max-w-7xl w-full px-2">
          <div className="flex my-10">
            <ForstaKravene />
            <StatusIOrganisasjonen />
          </div>
          {forsideVarsel?.meldingStatus === MeldingStatus.ACTIVE && (
            <div className="mt-16 mb-32" id="forsideVarselMelding">
              {forsideVarsel.alertType === AlertType.INFO ? (
                <div className="border-solid border-1 mt-16 p-8 bg-surface-info-subtle border-surface-info">
                  <Markdown source={forsideVarsel.melding} />
                </div>
              ) : (
                <div className="border-solid border-1 mt-16 p-8 bg-surface-warning-subtle border-surface-warning">
                  <Markdown source={forsideVarsel.melding} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

const EtterlevelseDokumentasjonList = ({ etterlevelseDokumentasjoner }: { etterlevelseDokumentasjoner: EtterlevelseDokumentasjonQL[] }) => {
  const sortedEtterlevelseDokumentasjoner = [...etterlevelseDokumentasjoner].sort((a, b) => moment(b.sistEndretEtterlevelse).valueOf() - moment(a.sistEndretEtterlevelse).valueOf())

  return (
    <div>
      <Heading size="medium" level="2">
        Mine sist dokumenterte
      </Heading>
      <div className="mt-6 flex flex-col gap-2">
        {sortedEtterlevelseDokumentasjoner.map((etterlevelseDokumentasjon, index) => {
          return (
            <LinkPanel href={'/dokumentasjon/' + etterlevelseDokumentasjon.id} key={etterlevelseDokumentasjon.title + '_' + index}>
              <LinkPanel.Title className="text-xl">
                E{etterlevelseDokumentasjon.etterlevelseNummer} {etterlevelseDokumentasjon.title}
              </LinkPanel.Title>
              <LinkPanel.Description>
                {!!etterlevelseDokumentasjon.sistEndretEtterlevelse ? `Sist endret: ${moment(etterlevelseDokumentasjon.sistEndretEtterlevelse).format('ll')}` : ''}
              </LinkPanel.Description>
            </LinkPanel>
          )
        })}
      </div>
    </div>
  )
}

const ForstaKravene = () => (
  <div className="w-full mr-2.5">
    <LinkPanel
      href="/tema"
      onClick={() => {
        ampli.logEvent('navigere', { kilde: 'forside-panel', app: 'etterlevelse', til: '/tema', fra: '/' })
      }}
    >
      <LinkPanel.Title>Forstå kravene</LinkPanel.Title>
      <LinkPanel.Description>Få oversikt over krav til etterlevelse, og bli trygg på at du kjenner til alle relevante krav for det du lager</LinkPanel.Description>
    </LinkPanel>
  </div>
)

const StatusIOrganisasjonen = () => (
  <div className="w-full ml-2.5">
    <LinkPanel
      href="https://metabase.intern.nav.no/dashboard/116-dashboard-for-etterlevelse"
      onClick={() => {
        ampli.logEvent('navigere', {
          kilde: 'forside-panel',
          app: 'etterlevelse',
          til: 'https://metabase.intern.nav.no/dashboard/117-dashboard-for-etterlevelse',
          fra: '/',
        })
      }}
    >
      <LinkPanel.Title>Status i organisasjonen</LinkPanel.Title>
      <LinkPanel.Description>Følg med på status og se hvor godt NAV sine områder dokumenterer på kravene</LinkPanel.Description>
    </LinkPanel>
  </div>
)

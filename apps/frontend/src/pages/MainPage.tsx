import { useEffect, useState } from 'react'
import { Markdown } from '../components/common/Markdown'
import { AlertType, EtterlevelseDokumentasjonQL, Melding, MeldingStatus, MeldingType, PageResponse } from '../constants'
import { getMeldingByType } from '../api/MeldingApi'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { Button, Heading, Link, LinkPanel } from '@navikt/ds-react'
import EditEtterlevelseDokumentasjonModal from '../components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonModal'
import { TemaPanels } from './TemaoversiktPage'
import { user } from '../services/User'
import { PageLayout } from '../components/scaffold/Page'
import { useQuery } from '@apollo/client'
import { Variables, query } from './MyEtterlevelseDokumentasjonerPage'
import moment from 'moment'

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<Melding>()
  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<{ etterlevelseDokumentasjoner: PageResponse<EtterlevelseDokumentasjonQL> }, Variables>(query, {
    variables: { sistRedigert: 4 },
    skip: !user.isLoggedIn(),
  })

  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Hovedside', ...userRoleEventProp })
      ; (async () => {
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
              {data?.etterlevelseDokumentasjoner.content.length && (
                <EtterlevelseDokumentasjonList etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content} />
              )}
              <div className="mt-8 flex justify-end">
                <div className="mr-4">
                  <EditEtterlevelseDokumentasjonModal />
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
        <div className="max-w-7xl w-full px-2 pb-6">
          <div className="mt-8 w-full px-8">
            <TemaPanels subContent />
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
        {
          sortedEtterlevelseDokumentasjoner.map((etterlevelseDokumentasjon, index) => {
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
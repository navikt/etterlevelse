import { useQuery } from '@apollo/client'
import { Alert, BodyLong, Button, Heading, LinkPanel, List, Skeleton } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMeldingByType } from '../api/MeldingApi'
import { Markdown } from '../components/common/Markdown'
import {
  etterlevelseDokumentasjonCreateUrl,
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonerUrl,
  temaUrl,
} from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { EtterlevelseDokumentasjonsPanel } from '../components/etterlevelseDokumentasjon/EtterlevelseDokumentasjonsPanel'
import { PageLayout } from '../components/scaffold/Page'
import {
  EAlertType,
  EMeldingStatus,
  EMeldingType,
  IMelding,
  IPageResponse,
  TEtterlevelseDokumentasjonQL,
} from '../constants'
import { getEtterlevelseDokumentasjonListQuery } from '../query/EtterlevelseDokumentasjonQuery'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { user } from '../services/User'
import { getNumberOfMonthsBetween } from '../util/checkAge'
import { sortEtterlevelseDokumentasjonerByUsersLastModifiedDate } from '../util/sortEtterlevelseDokumentasjonerByUsersLastModifiedDate'
import { TVariables } from './MyEtterlevelseDokumentasjonerPage'

export const MainPage = () => {
  const [forsideVarsel, setForsideVarsle] = useState<IMelding>()
  const navigate = useNavigate()

  const { data, loading: etterlevelseDokumentasjonLoading } = useQuery<
    { etterlevelseDokumentasjoner: IPageResponse<TEtterlevelseDokumentasjonQL> },
    TVariables
  >(getEtterlevelseDokumentasjonListQuery, {
    variables: { sistRedigert: 20 },
    skip: !user.isLoggedIn(),
  })

  useEffect(() => {
    ampli.logEvent('sidevisning', { side: 'Hovedside', ...userRoleEventProp })
    ;(async () => {
      await getMeldingByType(EMeldingType.FORSIDE).then((r) => {
        if (r.numberOfElements > 0) {
          setForsideVarsle(r.content[0])
        }
      })
    })()
  }, [])

  return (
    <PageLayout noPadding fullWidth>
      <div className='bg-blue-50 py-10 flex justify-center'>
        <div className='max-w-7xl w-full px-2'>
          <div className='flex flex-col'>
            <Heading className='flex justify-center' size='large' level='1'>
              Etterlevelse i Nav
            </Heading>
            <span className='flex justify-center'>Forstå og dokumentér</span>
          </div>
          {forsideVarsel?.meldingStatus === EMeldingStatus.ACTIVE && (
            <div className=' my-16 w-full justify-center flex'>
              <div className='w-fit' id='forsideVarselMelding'>
                {forsideVarsel.alertType === EAlertType.INFO ? (
                  <Alert fullWidth variant='info'>
                    <Markdown source={forsideVarsel.melding} />
                  </Alert>
                ) : (
                  <Alert fullWidth variant='warning'>
                    <Markdown source={forsideVarsel.melding} />
                  </Alert>
                )}
              </div>
            </div>
          )}

          {etterlevelseDokumentasjonLoading && (
            <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
              <Heading as={Skeleton} size='large'>
                Card-title
              </Heading>
              <Skeleton variant='text' width='100%' />
              <Skeleton variant='text' width='100%' />
            </div>
          )}

          {!etterlevelseDokumentasjonLoading && data?.etterlevelseDokumentasjoner.content && (
            <div className='bg-white mt-8 p-8 shadow-md shadow-[#00000040]'>
              {data?.etterlevelseDokumentasjoner.content.length === 0 && (
                <div>
                  <Heading size='medium' level='2'>
                    Etterlevelse i Nav
                  </Heading>
                  <span>
                    For å dokumentere etterlevelse må du opprette et etterlevelsesdokument. Du vil
                    da se hvilke krav som gjelder for din løsning og kan dokumentere hvordan
                    løsningen etterlever kravene.
                  </span>
                </div>
              )}
              {data?.etterlevelseDokumentasjoner.content.length !== 0 && (
                <EtterlevelseDokumentasjonList
                  etterlevelseDokumentasjoner={data?.etterlevelseDokumentasjoner.content}
                />
              )}
              <div className='mt-8 flex justify-end'>
                <div className='mr-4'>
                  <Button
                    onClick={() => {
                      window.scrollTo(0, 0)
                      ampli.logEvent('knapp klikket', {
                        tekst: 'Nytt etterlevelsesdokument fra forsiden',
                      })
                      navigate(etterlevelseDokumentasjonCreateUrl)
                    }}
                    size='medium'
                    variant={
                      data?.etterlevelseDokumentasjoner.content.length ? 'secondary' : 'primary'
                    }
                    className='whitespace-nowrap ml-5'
                  >
                    Nytt etterlevelsesdokument
                  </Button>
                </div>
                <Button
                  variant='tertiary'
                  className='underline hover:no-underline'
                  onClick={() => {
                    window.scrollTo(0, 0)
                    ampli.logEvent('navigere', {
                      app: 'etterlevelse',
                      kilde: 'forside-panel',
                      til: etterlevelseDokumentasjonerUrl(),
                      fra: '/',
                    })
                    navigate(etterlevelseDokumentasjonerUrl())
                  }}
                >
                  Alle etterlevelsesdokumenter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col items-center w-full'>
        <div className='max-w-7xl w-full px-2'>
          <div className='flex my-10'>
            <ForstaKravene />
            <StatusIOrganisasjonen />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

const EtterlevelseDokumentasjonList = ({
  etterlevelseDokumentasjoner,
}: {
  etterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
}) => {
  const sortedEtterlevelseDokumentasjoner = sortEtterlevelseDokumentasjonerByUsersLastModifiedDate([
    ...etterlevelseDokumentasjoner,
  ])

  const today = new Date()

  const filteredEtterlevelsesDokumentasjoner = sortedEtterlevelseDokumentasjoner
    .filter((etterlevelseDokumentasjon) => {
      let monthAge
      if (etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg) {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg,
          today
        )
      } else {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.changeStamp.createdDate || '',
          today
        )
      }
      return monthAge <= 6
    })
    .slice(0, 2)

  return (
    <div>
      <Heading size='medium' level='2'>
        Mine sist dokumenterte
      </Heading>
      {filteredEtterlevelsesDokumentasjoner.length !== 0 && (
        <List className='mt-6 flex flex-col gap-2'>
          {filteredEtterlevelsesDokumentasjoner
            .slice(0, 2)
            .map((etterlevelseDokumentasjon, index) => (
              <List.Item icon={<div />} key={etterlevelseDokumentasjon.title + '_' + index}>
                <EtterlevelseDokumentasjonsPanel
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  onClick={() =>
                    ampli.logEvent('navigere', {
                      app: 'etterlevelse',
                      kilde: 'forside-panel',
                      til: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon.id),
                      fra: '/',
                    })
                  }
                />
              </List.Item>
            ))}
        </List>
      )}
      {filteredEtterlevelsesDokumentasjoner.length === 0 && (
        <BodyLong id='main-page-text'>
          Ingen etterlevelsesdokument som har blitt opprettet eller endret av deg de siste 6
          månedene.
        </BodyLong>
      )}
    </div>
  )
}

const ForstaKravene = () => (
  <div className='w-full mr-2.5'>
    <LinkPanel
      href={temaUrl}
      onClick={() => {
        ampli.logEvent('navigere', {
          kilde: 'forside-panel',
          app: 'etterlevelse',
          til: temaUrl,
          fra: '/',
        })
      }}
    >
      <LinkPanel.Title>Forstå kravene</LinkPanel.Title>
      <LinkPanel.Description>
        Få oversikt over krav til etterlevelse, og bli trygg på at du kjenner til alle relevante
        krav for det du lager
      </LinkPanel.Description>
    </LinkPanel>
  </div>
)

const StatusIOrganisasjonen = () => (
  <div className='w-full ml-2.5'>
    <LinkPanel
      href='https://metabase.ansatt.nav.no/dashboard/116-dashboard-for-etterlevelse'
      onClick={() => {
        ampli.logEvent('navigere', {
          kilde: 'forside-panel',
          app: 'etterlevelse',
          til: 'https://metabase.ansatt.nav.no/dashboard/117-dashboard-for-etterlevelse',
          fra: '/',
        })
      }}
    >
      <LinkPanel.Title>Status i organisasjonen</LinkPanel.Title>
      <LinkPanel.Description>
        Følg med på status og se hvor godt Nav sine områder dokumenterer på kravene
      </LinkPanel.Description>
    </LinkPanel>
  </div>
)

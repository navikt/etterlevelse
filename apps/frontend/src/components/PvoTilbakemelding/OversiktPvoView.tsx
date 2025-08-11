import {
  Alert,
  BodyShort,
  FormSummary,
  Heading,
  Label,
  Link,
  List,
  ReadMore,
  Tag,
} from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../../api/BehandlingensLivslopApi'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  EPvoTilbakemeldingStatus,
  ERisikoscenarioType,
  IBehandlingensLivslop,
  IPageResponse,
  IPvkDokument,
  IPvoTilbakemelding,
  IRisikoscenario,
  ITeam,
  ITeamResource,
  ITiltak,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import { getFormStatus } from '../PvkDokument/OversiktView'
import { FormSummaryPanel } from '../PvkDokument/common/FormSummaryPanel'
import { ExternalLink } from '../common/RouteLink'
import { etterlevelsesDokumentasjonEditUrl } from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { pvkDokumentasjonPvkBehovUrl } from '../common/RouteLinkPvk'
import { risikoscenarioFilterAlleUrl } from '../common/RouteLinkRisiko'
import PvoFormButtons from './edit/PvoFormButtons'
import { PvoTilbakemeldingAnsvarligForm } from './edit/PvoTilbakemeldingSetAnsvarForm'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setSelectedStep: (step: number) => void
  updateTitleUrlAndStep: (step: number) => void
  pvoTilbakemelding: IPvoTilbakemelding
  formRef: RefObject<any>
}

const StepTitle: string[] = [
  'Oversikt og status',
  'Behandlingens livsløp',
  'Behandlingens art og omfang',
  'Involvering av eksterne',
  'Identifisering av risikoscenarioer og tiltak',
  'Risikobildet etter tiltak',
  'Send tilbakemelding',
]

export const OversiktPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setSelectedStep,
  updateTitleUrlAndStep,
  pvoTilbakemelding,
  formRef,
}) => {
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [allRisikoscenario, setAllRisikoscenario] = useState<IRisikoscenario[]>([])
  const [allTiltak, setAllTiltak] = useState<ITiltak[]>([])

  const getMemberListToString = (membersData: ITeamResource[]): string => {
    let memberList = ''
    membersData.forEach((member: ITeamResource) => {
      memberList += `, ${member.fullName}`
    })

    return memberList.substring(2)
  }

  const getTeamsNameToString = (teamsData: ITeam[]): string => {
    let teamList = ''
    teamsData.forEach((team: ITeam) => {
      teamList += `, ${team.name}`
    })

    return teamList.substring(2)
  }

  const getRisikoscenarioStatus = (step: number) => {
    if (step === 2) {
      const generelSenario = allRisikoscenario.filter(
        (risiko: IRisikoscenario) => risiko.generelScenario
      )
      const kravSenario = allRisikoscenario.filter(
        (risiko: IRisikoscenario) => !risiko.generelScenario
      )

      return (
        <div className='gap-2 flex pt-1'>
          {kravSenario.length > 0 && (
            <Tag variant='success' size='xsmall'>
              {kravSenario.length} kravspesifikke risikoscenario
            </Tag>
          )}
          {generelSenario.length > 0 && (
            <Tag variant='success' size='xsmall'>
              {generelSenario.length} øvrige risikoscenario
            </Tag>
          )}
          {allTiltak.length > 0 && (
            <Tag variant='success' size='xsmall'>
              {allTiltak.length} tiltak
            </Tag>
          )}
        </div>
      )
    } else {
      return getRisikoscenarioEtterTiltakStatus()
    }
  }

  const getRisikoscenarioEtterTiltakStatus = () => {
    const risikoscenarioMedIngenTiltak: IRisikoscenario[] = allRisikoscenario.filter(
      (risiko: IRisikoscenario) => risiko.ingenTiltak
    )
    const risikoscenarioMedTiltak: IRisikoscenario[] = allRisikoscenario.filter(
      (risiko: IRisikoscenario) => !risiko.ingenTiltak
    )

    return (
      <div className='gap-2 flex pt-1'>
        <Tag variant='success' size='xsmall'>
          Antall ferdig vurdert: {risikoscenarioMedTiltak.length}
        </Tag>

        <Tag variant='neutral' size='xsmall'>
          Antall risikoscenario med tiltak ikke aktuelt: {risikoscenarioMedIngenTiltak.length}
        </Tag>
      </div>
    )
  }

  useEffect(() => {
    ;(async () => {
      await getBehandlingensLivslopByEtterlevelseDokumentId(
        pvkDokument.etterlevelseDokumentId
      ).then((response: IBehandlingensLivslop) => {
        if (response) {
          setBehandlingensLivslop(response)
        }
      })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => {
            setAllRisikoscenario(response.content)
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) =>
          setAllTiltak(response.content)
        )
      }
    })()
  }, [pvkDokument])

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='px-6 py-9 rounded-lg max-w-[766px] w-full bg-[#E3EFF7] mb-18'>
        {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
          <PvoTilbakemeldingAnsvarligForm
            pvkDokumentId={pvkDokument.id}
            initialValue={pvoTilbakemelding}
            formRef={formRef}
          />
        )}

        {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <div>
            <Label>Ansvarlig</Label>
            <List as='ul'>
              {pvoTilbakemelding.ansvarlig.length === 0 && (
                <List.Item>Ingen ansvarlig satt</List.Item>
              )}
              {pvoTilbakemelding.ansvarligData &&
                pvoTilbakemelding.ansvarligData.length !== 0 &&
                pvoTilbakemelding.ansvarligData.map((data) => (
                  <List.Item key={data.navIdent}>{data.fullName}</List.Item>
                ))}
            </List>
          </div>
        )}
      </div>
      <div>
        <Heading level='1' size='medium' className='mb-5'>
          Oversikt over PVK-prosessen
        </Heading>
        <ReadMore className='mb-5 max-w-[766px]' header='Hvordan skal vi jobbe med PVK?'>
          <BodyShort>
            I PVK-en skal dere beskrive deres behandling av personopplysninger, og gjøre en
            risikoanalyse. Prosessen inkluderer:
          </BodyShort>
          <List as='ol'>
            <List.Item>
              Dere beskriver behandlingen slik at det er enklere å identifisere risikoer.
            </List.Item>
            <List.Item>
              Dere gjør risikoanalyse og setter tiltak og vurderer så tiltakenes effekt.
            </List.Item>
            <List.Item>Dere sender inn PVK til vurdering av Personvernombudet (PVO).</List.Item>
            <List.Item>
              Dere gjør eventuelle endringer, og sender til risikoeier for beslutning om
              risikonivået er akseptabelt.
            </List.Item>
            <List.Item>
              Hvis dere senere endrer hvordan dere behandler personopplysninger, skal dere vurdere
              risikobildet på nytt.
            </List.Item>
          </List>
        </ReadMore>

        <FormSummary className='my-3'>
          <FormSummary.Header>
            <FormSummary.Heading level='2'>Status</FormSummary.Heading>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Value>
                {/* TODO: lage et readonly url/komponent for pvkdokument vurderings side */}
                <ExternalLink
                  href={pvkDokumentasjonPvkBehovUrl(
                    pvkDokument.etterlevelseDokumentId,
                    pvkDokument.id
                  )}
                >
                  Vurdér behov for PVK
                </ExternalLink>
              </FormSummary.Value>
              <FormSummary.Value className='gap-2 flex'>
                {pvkDokument.skalUtforePvk && 'Vi skal gjennomføre PVK'}
                {!pvkDokument.skalUtforePvk && 'Vi skal ikke gjennomføre PVK'}
              </FormSummary.Value>
            </FormSummary.Answer>

            <FormSummary.Answer>
              <FormSummary.Value>
                <Link
                  onClick={() => updateTitleUrlAndStep(2)}
                  href={window.location.pathname.slice(0, -1) + 2}
                  className='cursor-pointer'
                >
                  Behandlingens livsløp
                </Link>
              </FormSummary.Value>
              <FormSummary.Value className='gap-2 flex'>
                <div className='gap-2 flex pt-1'>
                  {!behandlingensLivslop && (
                    <Tag variant='neutral' size='xsmall'>
                      Ikke påbegynt
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length === 0 && (
                    <Tag variant='neutral' size='xsmall'>
                      Ingen filer er lastet opp
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length !== 0 && (
                    <Tag variant='success' size='xsmall'>
                      Lastet opp {behandlingensLivslop.filer.length}{' '}
                      {behandlingensLivslop.filer.length === 1 ? 'fil' : 'filer'}
                    </Tag>
                  )}
                  {behandlingensLivslop && (
                    <Tag
                      variant={
                        behandlingensLivslop.beskrivelse !== '' &&
                        behandlingensLivslop.beskrivelse !== undefined
                          ? 'success'
                          : 'neutral'
                      }
                      size='xsmall'
                    >
                      {behandlingensLivslop.beskrivelse !== '' &&
                      behandlingensLivslop.beskrivelse !== undefined
                        ? 'Skriftlig beskrivelse'
                        : 'Ingen skriftlig beskrivelse'}
                    </Tag>
                  )}
                </div>
              </FormSummary.Value>
            </FormSummary.Answer>

            {StepTitle.slice(2).map((title: string, index: number) => {
              let panelHref: string = window.location.pathname.slice(0, -1) + (index + 3)

              if (index + 3 === 6) {
                panelHref += risikoscenarioFilterAlleUrl()
              }

              return (
                <FormSummaryPanel
                  key={title}
                  title={title}
                  onClick={() => updateTitleUrlAndStep(index + 3)}
                  href={panelHref}
                  step={index}
                  pvkDokumentStatus={pvkDokument.status}
                  status={getFormStatus(pvkDokument, index)}
                  customStatusTag={
                    index === 2 || index === 3 ? getRisikoscenarioStatus(index) : undefined
                  }
                />
              )
            })}
          </FormSummary.Answers>
        </FormSummary>

        <List className='w-full'>
          <Heading size='medium' className='mb-3'>
            Deltaker og ansvarlige
          </Heading>
          <List.Item>
            <BodyShort>
              <strong>Risikoeier:</strong>{' '}
              {etterlevelseDokumentasjon.risikoeiereData &&
                etterlevelseDokumentasjon.risikoeiereData.length !== 0 &&
                getMemberListToString(etterlevelseDokumentasjon.risikoeiereData)}
              {!etterlevelseDokumentasjon.risikoeiereData ||
                (etterlevelseDokumentasjon.risikoeiereData &&
                  etterlevelseDokumentasjon.risikoeiereData.length === 0 &&
                  'Ingen risikoeier angitt')}
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <strong>Avdeling:</strong>{' '}
              {etterlevelseDokumentasjon.nomAvdelingId && etterlevelseDokumentasjon.avdelingNavn}
              {!etterlevelseDokumentasjon.nomAvdelingId && 'Avdeling er ikke angitt'}
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <strong>Team eller personer:</strong>{' '}
              {etterlevelseDokumentasjon.teamsData &&
                getTeamsNameToString(etterlevelseDokumentasjon.teamsData)}
              {etterlevelseDokumentasjon.teamsData &&
                etterlevelseDokumentasjon.teamsData.length !== 0 &&
                ', '}
              {etterlevelseDokumentasjon.resourcesData &&
                getMemberListToString(etterlevelseDokumentasjon.resourcesData)}
              {!etterlevelseDokumentasjon.teamsData &&
                !etterlevelseDokumentasjon.resourcesData &&
                'Avdeling er ikke angitt'}
            </BodyShort>
          </List.Item>
        </List>

        {!etterlevelseDokumentasjon.risikoeiereData && (
          <div className='w-fit'>
            <Alert variant='warning'>
              Dere har ikke lagt inn en risikoeier. Dere må gjøre dette før dere sender PVK-en til
              Personvernombudet. Dere kan redigere deltakere og ansvarlige under
              <Link
                href={etterlevelsesDokumentasjonEditUrl(etterlevelseDokumentasjon.id)}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='redigere etterlevelsesdokumentasjon'
              >
                Dokumentegenskaper (åpner i en ny fane).
              </Link>
            </Alert>
          </div>
        )}

        <PvoFormButtons
          activeStep={activeStep}
          setActiveStep={updateTitleUrlAndStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default OversiktPvoView

import { Alert, BodyShort, FormSummary, Heading, Link, List, ReadMore, Tag } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '../../api/BehandlingensLivslopApi'
import {
  EPVO,
  EPvkDokumentStatus,
  IBehandlingensLivslop,
  IPvkDokument,
  IRisikoscenario,
  ITeam,
  ITeamResource,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import { StepTitle } from '../../pages/PvkDokumentPage'
import FormButtons from '../PvkDokument/edit/FormButtons'
import { ExternalLink } from '../common/RouteLink'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  allRisikoscenarioList: IRisikoscenario[]
  activeStep: number
  setSelectedStep: (step: number) => void
  updateTitleUrlAndStep: (step: number) => void
}

export const OversiktView = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    pvkDokument,
    allRisikoscenarioList,
    activeStep,
    setSelectedStep,
    updateTitleUrlAndStep,
  } = props

  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()

  const formStatus = [
    pvkDokument.stemmerPersonkategorier !== null ||
      pvkDokument.personkategoriAntallBeskrivelse ||
      pvkDokument.tilgangsBeskrivelsePersonopplysningene ||
      pvkDokument.lagringsBeskrivelsePersonopplysningene,
    pvkDokument.harInvolvertRepresentant !== null ||
      pvkDokument.representantInvolveringsBeskrivelse ||
      pvkDokument.harDatabehandlerRepresentantInvolvering !== null ||
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
    allRisikoscenarioList.length > 0,
    allRisikoscenarioList.filter(
      (risikoscenario) =>
        risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
        risikoscenario.sannsynlighetsNivaaEtterTiltak ||
        risikoscenario.nivaaBegrunnelseEtterTiltak !== ''
    ).length > 0,
  ]

  const getMemberListToString = (membersData: ITeamResource[]): string => {
    let memberList = ''
    membersData.forEach((member) => {
      memberList += `, ${member.fullName}`
    })

    return memberList.substring(2)
  }

  const getTeamsNameToString = (teamsData: ITeam[]): string => {
    let teamList = ''
    teamsData.forEach((team) => {
      teamList += `, ${team.name}`
    })

    return teamList.substring(2)
  }

  const getStatus = (step: number) => {
    if (step === 4) {
      return undefined
    } else {
      return formStatus[step] ? 'Påbegynt' : 'Ikke påbegynt'
    }
  }

  useEffect(() => {
    ;(async () => {
      await getBehandlingensLivslopByEtterlevelseDokumentId(
        pvkDokument.etterlevelseDokumentId
      ).then((response) => {
        if (response) {
          setBehandlingensLivslop(response)
        }
      })
    })()
  }, [])

  return (
    <div className="flex justify-center">
      <div>
        <Heading level="1" size="medium" className="mb-5">
          Oversikt over PVK-prosessen
        </Heading>
        <ReadMore className="mb-5 max-w-[766px]" header="Hvordan skal vi jobbe med PVK?">
          <BodyShort>
            I PVK-en skal dere beskrive deres behandling av personopplysninger, og gjøre en
            risikoanalyse. Prosessen inkluderer:
          </BodyShort>
          <List as="ol">
            <List.Item>
              Dere beskriver behandlingen slik at det er enklere å identifisere risikoer.
            </List.Item>
            <List.Item>Dere gjør risikoanalyse og setter tiltak.</List.Item>
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

        <FormSummary className="my-3">
          <FormSummary.Header>
            <FormSummary.Heading level="2">Status</FormSummary.Heading>
          </FormSummary.Header>
          <FormSummary.Answers>
            <FormSummary.Answer>
              <FormSummary.Value>
                <Link
                  onClick={() => updateTitleUrlAndStep(2)}
                  href={window.location.pathname.slice(0, -1) + 2}
                  className="cursor-pointer"
                >
                  Behandlingens livsløp
                </Link>
              </FormSummary.Value>
              <FormSummary.Value className="gap-2 flex">
                <div className="gap-2 flex pt-1">
                  {!behandlingensLivslop && (
                    <Tag variant="warning" size="xsmall">
                      Ikke påbegynt
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length === 0 && (
                    <Tag variant="neutral" size="xsmall">
                      Ingen filer er lastet opp
                    </Tag>
                  )}
                  {behandlingensLivslop && behandlingensLivslop.filer.length !== 0 && (
                    <Tag variant="success" size="xsmall">
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
                      size="xsmall"
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

            <FormSummary.Answer>
              <FormSummary.Value>
                <ExternalLink
                  href={`/dokumentasjon/${pvkDokument.etterlevelseDokumentId}/pvkbehov/${pvkDokument.id}`}
                >
                  Vurdér behov for PVK
                </ExternalLink>
              </FormSummary.Value>
              <FormSummary.Value className="gap-2 flex">
                {pvkDokument.skalUtforePvk && 'Vi skal gjennomføre PVK'}
                {!pvkDokument.skalUtforePvk && 'Vi skal ikke gjennomføre PVK'}
              </FormSummary.Value>
            </FormSummary.Answer>

            {StepTitle.slice(1).map((title, index) => {
              let panelHref = window.location.pathname.slice(0, -1) + (index + 3)
              if (index + 3 === 6) {
                panelHref += '?tab=risikoscenarioer&filter=alle'
              }
              return (
                <FormSummaryPanel
                  key={title}
                  title={title}
                  onClick={() => updateTitleUrlAndStep(index + 3)}
                  href={panelHref}
                  step={index}
                  pvkDokumentStatus={pvkDokument.status}
                  status={getStatus(index)}
                />
              )
            })}
          </FormSummary.Answers>
        </FormSummary>

        <List title="Deltaker og ansvarlige" className="w-full">
          <List.Item>
            <BodyShort>
              <strong>Risikoeier:</strong>{' '}
              {etterlevelseDokumentasjon.risikoeiereData &&
                getMemberListToString(etterlevelseDokumentasjon.risikoeiereData)}
              {!etterlevelseDokumentasjon.risikoeiereData && 'Ingen risikoeier angitt'}
            </BodyShort>
          </List.Item>
          <List.Item>
            <BodyShort>
              <strong>Avdeling:</strong>{' '}
              {etterlevelseDokumentasjon.avdeling && etterlevelseDokumentasjon.avdeling.shortName}
              {!etterlevelseDokumentasjon.avdeling && 'Avdeling er ikke angitt'}
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
          <div className="w-fit">
            <Alert variant="warning">
              Dere har ikke lagt inn en risikoeier. Dere må gjøre dette før dere sender PVK-en til
              Personvernombudet. Dere kan redigere deltakere og ansvarlige under
              <Link
                href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="redigere etterlevelsesdokumentasjon"
              >
                Dokumentegenskaper (åpner i en ny fane).
              </Link>
            </Alert>
          </div>
        )}

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          activeStep={activeStep}
          setActiveStep={updateTitleUrlAndStep}
          setSelectedStep={setSelectedStep}
          customOriginLink={EPVO.oversikt}
          customOriginLinkLabel="Tilbake til PVO oversikt side"
        />
      </div>
    </div>
  )
}

interface IFormSummaryPanelProps {
  title: string
  onClick: () => void
  href: string
  step: number
  pvkDokumentStatus: EPvkDokumentStatus
  status?: 'Ikke påbegynt' | 'Påbegynt'
}

export const pvkDokumentStatusToText = (status: EPvkDokumentStatus) => {
  switch (status) {
    case EPvkDokumentStatus.AKTIV:
      return 'Under arbeid'
    case EPvkDokumentStatus.UNDERARBEID:
      return 'Under arbeid'
    case EPvkDokumentStatus.SENDT_TIL_PVO:
      return 'Sendt inn til Personvernombudet'
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return 'Vurdert av Personvernombudet'
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return 'Godkjent av Risikoeier'
  }
}

const FormSummaryPanel = (props: IFormSummaryPanelProps) => {
  const { title, onClick, href, status, pvkDokumentStatus, step } = props
  return (
    <FormSummary.Answer key={title}>
      <FormSummary.Value>
        <Link onClick={onClick} href={href} className="cursor-pointer">
          {title}
        </Link>
      </FormSummary.Value>
      <FormSummary.Value>
        {status && (
          <Tag variant={status === 'Ikke påbegynt' ? 'warning' : 'info'} size="xsmall">
            {status}
          </Tag>
        )}
        {step === 4 && (
          <Tag
            variant={pvkDokumentStatus !== EPvkDokumentStatus.UNDERARBEID ? 'info' : 'warning'}
            size="xsmall"
          >
            {pvkDokumentStatusToText(pvkDokumentStatus)}
          </Tag>
        )}
        {step === 4 && (
          <BodyShort>
            Her får dere oversikt over alle deres svar. PVK-dokumentasjon er ikke ennå sendt inn.
          </BodyShort>
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  )
}

export default OversiktView

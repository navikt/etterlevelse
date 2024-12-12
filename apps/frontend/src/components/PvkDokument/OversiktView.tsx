import { Alert, BodyShort, FormSummary, Heading, Link, List, ReadMore, Tag } from '@navikt/ds-react'
import { IPvkDokument, ITeam, ITeamResource, TEtterlevelseDokumentasjonQL } from '../../constants'
import { StepTitle } from '../../pages/PvkDokumentPage'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  risikoscenarioTilknyttetKrav: any[]
  generelleRisikoscenario: any[]
  activeStep: number
  updateTitleUrlAndStep: (step: number) => void
}

export const OversiktView = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    pvkDokument,
    risikoscenarioTilknyttetKrav,
    generelleRisikoscenario,
    activeStep,
    updateTitleUrlAndStep,
  } = props

  const formStatus = [
    pvkDokument.personkategoriAntallBeskrivelse ||
      pvkDokument.tilgangsBeskrivelsePersonopplysningene ||
      pvkDokument.lagringsBeskrivelsePersonopplysningene,
    pvkDokument.representantInvolveringsBeskrivelse ||
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse,
    risikoscenarioTilknyttetKrav.length > 0,
    generelleRisikoscenario.length > 0,
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

  return (
    <div className="flex justify-center">
      <div>
        <Heading level="1" size="medium" className="mb-5">
          Oversikt over PVK-prosessen
        </Heading>
        <ReadMore header="Hvordan skal vi jobbe med PVK?">
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
            {StepTitle.slice(1).map((title, index) => (
              <FormSummaryPanel
                key={title}
                title={title}
                onClick={() => updateTitleUrlAndStep(index + 2)}
                status={index === 4 ? undefined : formStatus[index] ? 'Påbegynt' : 'Ikke påbegynt'}
              />
            ))}
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
              {etterlevelseDokumentasjon.teamsData && ', '}
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
                Dokumentegenskaper (åpnes i nytt vindu).
              </Link>
            </Alert>
          </div>
        )}

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          activeStep={activeStep}
          setActiveStep={updateTitleUrlAndStep}
        />
      </div>
    </div>
  )
}

interface IFormSummaryPanelProps {
  title: string
  onClick: () => void
  status?: 'Ikke påbegynt' | 'Påbegynt'
}

const FormSummaryPanel = (props: IFormSummaryPanelProps) => {
  const { title, onClick, status } = props
  return (
    <FormSummary.Answer key={title}>
      <FormSummary.Value>
        <Link onClick={onClick} className="cursor-pointer">
          {title}
        </Link>
      </FormSummary.Value>
      <FormSummary.Value>
        {status && (
          <Tag variant={status === 'Ikke påbegynt' ? 'warning' : 'info'} size="xsmall">
            {status}
          </Tag>
        )}
        {!status && (
          <BodyShort>
            Her får dere oversikt over alle deres svar. PVK-dokumentasjon er ikke ennå sendt inn.
          </BodyShort>
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  )
}

export default OversiktView

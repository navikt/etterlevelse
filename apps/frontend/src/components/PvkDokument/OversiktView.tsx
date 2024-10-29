import { BodyShort, FormSummary, Heading, Link, List, ReadMore, Tag } from '@navikt/ds-react'
import { IPvkDokument } from '../../constants'
import { StepTitle } from '../../pages/PvkDokumentPage'

interface IProps {
  pvkDokument: IPvkDokument
  risikoscenarioTilknyttetKrav: any[]
  generelleRisikoscenario: any[]
  updateTitleUrlAndStep: (step: number) => void
}

export const OversiktView = (props: IProps) => {
  const {
    pvkDokument,
    risikoscenarioTilknyttetKrav,
    generelleRisikoscenario,
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

  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Oversikt over PVK-prosessen
      </Heading>
      <ReadMore header="Hvordan skal vi jobbe med PVK?">
        <BodyShort>
          I PVK-en skal dere beskrive deres behandling av personopplysninger, og gjøre en
          risikoanalyse. Prosessen inkluderer:
        </BodyShort>
        <List>
          <List.Item>
            Dere beskriver behandlingen slik at det er enklere å identifisere risikoer.
          </List.Item>
          <List.Item>Dere gjør risikoanalyse og setter tiltak.</List.Item>
          <List.Item>Dere sender inn PVK til vurdering av Personvernombudet (PVO).</List.Item>
          <List.Item>
            Dere gjør eventuelle endringer, og sender til risikoeier for beslutning om risikonivået
            er akseptabelt.
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

      <Heading level="2" size="small" className="mb-5">
        Deltaker og ansvarlige
      </Heading>
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

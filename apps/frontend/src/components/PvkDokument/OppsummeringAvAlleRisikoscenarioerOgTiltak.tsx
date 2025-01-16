import { BodyShort, Heading, List, Tabs, ToggleGroup } from '@navikt/ds-react'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const OppsummeringAvAlleRisikoscenarioerOgTiltak = (props: IProps) => {
  const { etterlevelseDokumentasjonId, activeStep, setActiveStep, setSelectedStep } = props
  return (
    <div className="flex justify-center w-full">
      <div className="w-full">
        <Heading level="1" size="medium" className="mb-5">
          Oppsummering av alle risikoscenarioer og tiltak
        </Heading>

        <BodyShort className="mt-5">
          Her får dere oversikt over alle risikoscenarioer og tiltak som er lagt inn. Dere kan velge
          å se på:
        </BodyShort>

        <List>
          <List.Item>
            Etterlevelseskrav, og hvilke risikoscenarioer og tiltak som finnes ved hvert krav
          </List.Item>
          <List.Item>
            Etterlevelseskrav, og hvilke risikoscenarioer og tiltak som finnes ved hvert krav
          </List.Item>
          <List.Item>Tiltak, inkludert hvilke tiltak som savner ansvarlig eller frist.</List.Item>
        </List>

        <Tabs defaultValue="risikoscenarioer" fill>
          <Tabs.List>
            <Tabs.Tab value="risikoscenarioer" label="Vis risikoscenarioer" />
            <Tabs.Tab value="tiltak" label=" Vis tiltak " />
          </Tabs.List>
          <Tabs.Panel value="risikoscenarioer" className="h-24 w-full justify-center">
            <ToggleGroup defaultValue="Alle risikoscenarioer" onChange={console.debug} fill>
              <ToggleGroup.Item value="Alle risikoscenarioer" label="Alle risikoscenarioer" />
              <ToggleGroup.Item value="" label="Effekt ikke vurdert" />
              <ToggleGroup.Item value="" label="Høy risiko" />
              <ToggleGroup.Item value="" label="Blir ikke tiltak" />
              <ToggleGroup.Item value="" label="Ferdig" />
            </ToggleGroup>
            <br />
            Her skal risikoscenarioer vises
          </Tabs.Panel>
          <Tabs.Panel value="tiltak" className="h-24 w-full">
            Her skal tiltak vises
          </Tabs.Panel>
        </Tabs>

        <div>
          <FormButtons
            etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
          />
        </div>
      </div>
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltak

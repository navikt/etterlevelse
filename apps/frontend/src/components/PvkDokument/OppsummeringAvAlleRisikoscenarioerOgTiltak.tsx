import { BodyShort, Heading, List, Tabs } from '@navikt/ds-react'
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
    <div>
      <div className="flex justify-center">
        <div>
          <Heading level="1" size="medium" className="mb-5">
            Oppsummering av alle risikoscenarioer og tiltak
          </Heading>

          <BodyShort className="mt-5">
            Her får dere oversikt over alle risikoscenarioer og tiltak som er lagt inn. Dere kan
            velge å se på:
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
        </div>
      </div>

      <Tabs defaultValue="etterlevelseskrav" fill>
        <Tabs.List>
          <Tabs.Tab value="risikoscenarioer" label="Vis risikoscenarioer" />
          <Tabs.Tab value="tiltak" label=" Vis tiltak " />
        </Tabs.List>
        <Tabs.Panel value="risikoscenarioer" className="h-24 w-full bg-gray-50 p-4">
          Her skal risikoscenarioer vises
        </Tabs.Panel>
        <Tabs.Panel value="tiltak" className="h-24 w-full bg-gray-50 p-4">
          Her skal tiltak vises
        </Tabs.Panel>
      </Tabs>
      <div className="flex justify-center">
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

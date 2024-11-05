import { BodyShort, Heading, List, Tabs } from '@navikt/ds-react'

export const OppsummeringAvAlleRisikoscenarioerOgTiltak = () => {
  return (
    <div>
      <Heading level="1" size="medium" className="mb-5">
        Oppsummering av alle risikoscenarioer og tiltak
      </Heading>

      <BodyShort className="mt-5">
        Her får dere oversikt over alle risikoscenarioer og tiltak som er lagt inn. Dere kan velge å
        se på:
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

      <Tabs defaultValue="etterlevelseskrav" fill>
        <Tabs.List>
          <Tabs.Tab value="etterlevelseskrav" label="Vis etterlevelseskrav" />
          <Tabs.Tab value="risikoscenarioer" label="Vis risikoscenarioer" />
          <Tabs.Tab value="tiltak" label=" Vis tiltak " />
        </Tabs.List>
        <Tabs.Panel value="etterlevelseskrav" className="h-24 w-full bg-gray-50 p-4">
          Her skal etterlevelseskrav vises
        </Tabs.Panel>
        <Tabs.Panel value="risikoscenarioer" className="h-24 w-full bg-gray-50 p-4">
          Her skal risikoscenarioer vises
        </Tabs.Panel>
        <Tabs.Panel value="tiltak" className="h-24 w-full bg-gray-50 p-4">
          Her skal tiltak vises
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default OppsummeringAvAlleRisikoscenarioerOgTiltak

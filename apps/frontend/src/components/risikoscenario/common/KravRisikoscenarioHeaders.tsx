import { Heading } from '@navikt/ds-react'

export const RisikoscenarioTiltakHeader = () => (
  <Heading level="3" size="small">
    Følgende tiltak gjelder for dette risikoscenariet
  </Heading>
)

export const RisikoscenarioSannsynlighetHeader = () => (
  <HeaderLayout>Risikoscenariets sannsynlighet</HeaderLayout>
)

export const RisikoscenarioKonsekvensnivaHeader = () => (
  <HeaderLayout>Risikoscenariets konsekvensnivå</HeaderLayout>
)

interface IPropsHeaderLayout {
  children: string
}

const HeaderLayout = ({ children }: IPropsHeaderLayout) => (
  <Heading level="3" size="small" className="my-5">
    {children}
  </Heading>
)

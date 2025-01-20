import { Alert, BodyShort, Heading, Link, List, Tabs, ToggleGroup } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario } from '../../constants'
import OppsumeringAccordianList from '../risikoscenario/OppsummeringAccordian/OppsumeringAccordianList'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const OppsummeringAvAlleRisikoscenarioerOgTiltak = (props: IProps) => {
  const { etterlevelseDokumentasjonId, pvkDokument, activeStep, setActiveStep, setSelectedStep } =
    props
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer) => {
            setRisikoscenarioList(risikoscenarioer.content)
          }
        )
      })()
    }
  }, [pvkDokument])

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
          <Tabs.Panel value="risikoscenarioer" className="w-full">
            <ToggleGroup defaultValue="Alle risikoscenarioer" onChange={console.debug} fill>
              <ToggleGroup.Item value="Alle risikoscenarioer" label="Alle risikoscenarioer" />
              <ToggleGroup.Item value="" label="Effekt ikke vurdert" />
              <ToggleGroup.Item value="" label="Høy risiko" />
              <ToggleGroup.Item value="" label="Blir ikke tiltak" />
              <ToggleGroup.Item value="" label="Ferdig" />
            </ToggleGroup>

            {risikoscenarioList.length === 0 && (
              <div className="my-5">
                <Alert variant="info">
                  <Heading spacing size="small" level="3">
                    Dere har foreløpig ingen risikoscenarioer
                  </Heading>
                  Risikoscenarioer legges inn under{' '}
                  <Link href={`/dokumentasjon/${etterlevelseDokumentasjonId}`}>
                    PVK-relaterte krav
                  </Link>{' '}
                  (åpnes i ny fane) eller eventuelt under øvrige risikoscenarioer (åpnes i ny fane).
                </Alert>
              </div>
            )}

            {risikoscenarioList.length !== 0 && (
              <div className="my-5">
                <OppsumeringAccordianList
                  risikoscenarioList={risikoscenarioList}
                  setRisikoscenarioList={setRisikoscenarioList}
                />
              </div>
            )}
          </Tabs.Panel>
          <Tabs.Panel value="tiltak" className="h-24 w-full">
            Her skal tiltak vises
          </Tabs.Panel>
        </Tabs>

        <div className="mt-5">
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

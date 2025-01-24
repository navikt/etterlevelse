import { Accordion, Alert, Button, ReadMore } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../../api/RisikoscenarioApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario, TKravQL } from '../../../constants'
import CreateRisikoscenario from '../edit/CreateRisikoscenario'
import LeggTilEksisterendeRisikoscenario from '../edit/LeggTilEksisterendeRisikoscenario'
import KravRisikoscenarioAccordionContent from './KravRisikoscenarioAccordionContent'

interface IProps {
  krav: TKravQL
  pvkDokument: IPvkDokument
  formRef: RefObject<any>
}

export const KravRisikoscenario = (props: IProps) => {
  const { krav, pvkDokument, formRef } = props
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [activeRisikoscenarioId, setActiveRisikoscenarioId] = useState<string>()

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.KRAV).then(
          (response) => {
            setRisikoscenarioer(
              response.content.filter(
                (risikoscenario) =>
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) => relevantekrav.kravNummer === krav.kravNummer
                  ).length === 0
              )
            )
            setRisikoscenarioForKrav(
              response.content.filter(
                (risikoscenario) =>
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) =>
                      relevantekrav.kravNummer === krav.kravNummer &&
                      relevantekrav.kravVersjon === krav.kravVersjon
                  ).length > 0
              )
            )
          }
        )
      }
    })()
  }, [krav, pvkDokument])

  const handleAccordionChange = (risikoscenarioId: string) => {
    setActiveRisikoscenarioId(risikoscenarioId)
  }

  return (
    <div className="w-full">
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">WIP</ReadMore>

      <div className="mt-5">
        {!isCreateMode && !isLeggTilEksisterendeMode && risikoscenarioForKrav.length === 0 && (
          <Alert variant="info" className="mb-5">
            Foreløpig finnes det ingen risikoscenarioer tilknyttet dette kravet.
          </Alert>
        )}

        {isLeggTilEksisterendeMode && (
          <LeggTilEksisterendeRisikoscenario
            kravnummer={krav.kravNummer}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            risikoscenarioForKrav={risikoscenarioForKrav}
            setRisikoscenarioForKrav={setRisikoscenarioForKrav}
            setIsLeggTilEksisterendeMode={setIsLeggTilEksisterendeMode}
          />
        )}

        {!isLeggTilEksisterendeMode && (
          <div className="mb-5">
            <Accordion>
              {risikoscenarioForKrav.map((risikoscenario, index) => (
                <Accordion.Item
                  open={activeRisikoscenarioId === risikoscenario.id}
                  id={risikoscenario.id}
                  key={index + '_' + risikoscenario.navn}
                  onOpenChange={(open) => {
                    handleAccordionChange(open ? risikoscenario.id : '')
                  }}
                >
                  <Accordion.Header>{risikoscenario.navn}</Accordion.Header>
                  <Accordion.Content>
                    <KravRisikoscenarioAccordionContent
                      risikoscenario={risikoscenario}
                      isCreateMode={isCreateMode}
                      kravnummer={krav.kravNummer}
                      risikoscenarioer={risikoscenarioer}
                      setRisikoscenarioer={setRisikoscenarioer}
                      risikoscenarioForKrav={risikoscenarioForKrav}
                      setRisikoscenarioForKrav={setRisikoscenarioForKrav}
                      formRef={formRef}
                    />
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}

        {isCreateMode && (
          <CreateRisikoscenario
            krav={krav}
            pvkDokumentId={pvkDokument.id}
            risikoscenarioer={risikoscenarioForKrav}
            setRisikoscenarioer={setRisikoscenarioForKrav}
            setIsCreateMode={setIsCreateMode}
            formRef={formRef}
          />
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && (
          <div className="flex gap-2 mt-8">
            <Button
              size="small"
              type="button"
              onClick={() => {
                setIsCreateMode(true)
              }}
            >
              Opprett nytt risikoscenario
            </Button>
            <Button
              size="small"
              variant="secondary"
              type="button"
              onClick={() => {
                setIsLeggTilEksisterendeMode(true)
              }}
            >
              Legg til eksisterende risikoscenario
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
export default KravRisikoscenario

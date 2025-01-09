import { Accordion, Alert, Button, ReadMore, Select } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { ERisikoscenarioType, IPvkDokument, IRisikoscenario, TKravQL } from '../../constants'
import CreateRisikoscenario from './edit/CreateRisikoscenario'
import RisikoscenarioAccordionContent from './risikoscenario/RisikoscenarioAccordianContent'

interface IProps {
  krav: TKravQL
  pvkDokument: IPvkDokument
  setIsPreview: (state: boolean) => void
}

export const KravRisikoscenario = (props: IProps) => {
  const { krav, pvkDokument, setIsPreview } = props
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [isLeggTilEksisterendeMode, setIsLeggTilEksisterendeMode] = useState<boolean>(false)
  const [risikoscenarioer, setRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenerioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.KRAV).then(
          (response) => {
            setRisikoscenarioer(
              response.content.filter(
                (risikoscenario) =>
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) => relevantekrav.kravNummer !== krav.kravNummer
                  ).length > 0
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

  return (
    <div className="w-full">
      <ReadMore header="Må vi dokumentere risikoscenarioer for alle PVK-relaterte krav?">
        WIP
      </ReadMore>
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">WIP</ReadMore>

      <div className="mt-5">
        {!isCreateMode && !isLeggTilEksisterendeMode && risikoscenerioForKrav.length === 0 && (
          <Alert variant="info" className="mb-5">
            Foreløpig finnes det ingen risikoscenarioer tilknyttet dette kravet.
          </Alert>
        )}

        {isLeggTilEksisterendeMode && (
          //LAGE EGEN KOMPONENT MED FORM
          <div>
            <Select label="Legg til eksisterende risikoscenario">
              <option value=""></option>
              {risikoscenarioer.map((risikoscenario) => {
                return (
                  <option key={risikoscenario.id} value={risikoscenario.id}>
                    {risikoscenario.navn}
                  </option>
                )
              })}
            </Select>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsLeggTilEksisterendeMode(false)}
            >
              avbyrt
            </Button>
          </div>
        )}

        {!isLeggTilEksisterendeMode && (
          <div className="mb-5">
            <Accordion>
              {risikoscenerioForKrav.map((risikoscenario, index) => (
                <Accordion.Item id={risikoscenario.id} key={index + '_' + risikoscenario.navn}>
                  <Accordion.Header>{risikoscenario.navn}</Accordion.Header>
                  <Accordion.Content>
                    <RisikoscenarioAccordionContent
                      risikoscenario={risikoscenario}
                      noCopyButton
                      isCreateMode={isCreateMode}
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
            risikoscenarioer={risikoscenerioForKrav}
            setRisikoscenarioer={setRisikoscenarioForKrav}
            setIsCreateMode={setIsCreateMode}
          />
        )}

        {!isCreateMode && !isLeggTilEksisterendeMode && (
          <div className="flex gap-2 mt-8">
            <Button
              size="small"
              type="button"
              onClick={() => {
                setIsPreview(true)
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
                setIsPreview(true)
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

import {Accordion, Alert, BodyLong, List, ReadMore} from '@navikt/ds-react'
import {useEffect, useState} from 'react'
import {getRisikoscenarioByPvkDokumentId} from '../../../api/RisikoscenarioApi'
import {getTiltakByPvkDokumentId} from '../../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
  TKravQL,
} from '../../../constants'
import KravRisikoscenarioAccordionContentReadOnly from './KravRisikoscenarioAccordionContentReadOnly'


interface IProps {
  krav: TKravQL
  pvkDokument: IPvkDokument
}


export const KravRisikoscenarioReadOnly = (props: IProps) => {
  const {krav, pvkDokument} = props
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])


  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response) => {
            setAlleRisikoscenarioer(response.content)

            setRisikoscenarioForKrav(
              response.content.filter(
                (risikoscenario) =>
                  !risikoscenario.generelScenario &&
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav) =>
                      relevantekrav.kravNummer === krav.kravNummer &&
                      relevantekrav.kravVersjon === krav.kravVersjon
                  ).length > 0
              )
            )
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((response) => {
          setTiltakList(response.content)
        })
      }
    })()
  }, [krav, pvkDokument])

  return (
    <div className="w-full">
      <ReadMore header="Slik dokumenterer dere risikoscenarioer og tiltak">
        <BodyLong>
          Her dokumenter dere risikoscenarioer og tiltak som gjelder for dette kravet. Her kan dere:
        </BodyLong>
        <List>
          <List.Item>Opprette nye risikoscenarioer.</List.Item>
          <List.Item>
            Koble på eksisterende risikoscenarioer som dere har beskrevet andre steder i løsninga.
          </List.Item>
          <List.Item>Opprette nye tiltak.</List.Item>
          <List.Item>
            Koble på eksisterende tiltak som dere har beskrevet andre steder i løsninga.
          </List.Item>
        </List>
      </ReadMore>

      <div className="mt-5">
        {risikoscenarioForKrav.length === 0 && (
          <Alert variant="info" className="mb-5">
            Foreløpig finnes det ingen risikoscenarioer tilknyttet dette kravet.
          </Alert>
        )}

        <div className="mb-5">
          <Accordion>
            {risikoscenarioForKrav.map((risikoscenario, index) => {

              return (
                <Accordion.Item
                  id={risikoscenario.id}
                  key={index + '_' + risikoscenario.navn}
                >
                  <Accordion.Header id={risikoscenario.id}>
                    {risikoscenario.navn}
                  </Accordion.Header>
                  <Accordion.Content>
                    <KravRisikoscenarioAccordionContentReadOnly
                      risikoscenario={risikoscenario}
                      alleRisikoscenarioer={alleRisikoscenarioer}
                      tiltakList={tiltakList}/>
                  </Accordion.Content>
                </Accordion.Item>
              )
            })}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
export default KravRisikoscenarioReadOnly

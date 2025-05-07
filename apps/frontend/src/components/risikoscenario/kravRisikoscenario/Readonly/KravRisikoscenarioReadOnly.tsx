import { Accordion, Alert } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../../../api/TiltakApi'
import {
  ERisikoscenarioType,
  IKravReference,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
  TKravQL,
} from '../../../../constants'
import { user } from '../../../../services/User'
import { KravRisikoscenarioOvrigeRisikoscenarier } from '../KravRisikoscenarioOvrigeRisikoscenarier/KravRisikoscenarioOvrigeRisikoscenarier'
import { KravRisikoscenarioReadMore } from '../KravRisikoscenarioReadMore/KravRisikoscenarioReadMore'
import KravRisikoscenarioAccordionContentReadOnly from './KravRisikoscenarioAccordionContentReadOnly'

type TProps = {
  krav: TKravQL
  pvkDokument: IPvkDokument
}

export const KravRisikoscenarioReadOnly: FunctionComponent<TProps> = ({ krav, pvkDokument }) => {
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && krav) {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (response: IPageResponse<IRisikoscenario>) => {
            setAlleRisikoscenarioer(response.content)

            setRisikoscenarioForKrav(
              response.content.filter(
                (risikoscenario: IRisikoscenario) =>
                  !risikoscenario.generelScenario &&
                  risikoscenario.relevanteKravNummer.filter(
                    (relevantekrav: IKravReference) =>
                      relevantekrav.kravNummer === krav.kravNummer &&
                      relevantekrav.kravVersjon === krav.kravVersjon
                  ).length > 0
              )
            )
          }
        )

        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) => {
          setTiltakList(response.content)
        })
      }
    })()
  }, [krav, pvkDokument])

  return (
    <div className='w-full'>
      <KravRisikoscenarioReadMore defaultOpen={risikoscenarioForKrav.length === 0} />

      <div className='mt-5'>
        {risikoscenarioForKrav.length === 0 && (
          <Alert variant='info' className='mb-5'>
            Foreløpig finnes det ingen risikoscenarioer tilknyttet dette kravet.
          </Alert>
        )}

        <div className='mb-5'>
          <Accordion>
            {risikoscenarioForKrav.map((risikoscenario: IRisikoscenario, index: number) => (
              <Accordion.Item id={risikoscenario.id} key={`${index}_${risikoscenario.navn}`}>
                <Accordion.Header id={risikoscenario.id}>{risikoscenario.navn}</Accordion.Header>
                <Accordion.Content>
                  <KravRisikoscenarioAccordionContentReadOnly
                    risikoscenario={risikoscenario}
                    alleRisikoscenarioer={alleRisikoscenarioer}
                    tiltakList={tiltakList}
                  />
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        {user.isPersonvernombud() && (
          <KravRisikoscenarioOvrigeRisikoscenarier pvkDokument={pvkDokument} pvoLink />
        )}
      </div>
    </div>
  )
}

export default KravRisikoscenarioReadOnly

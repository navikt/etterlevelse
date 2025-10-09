'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IKravReference, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Accordion, Alert } from '@navikt/ds-react'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { KravRisikoscenarioOvrigeRisikoscenarierLink } from '../common/kravRisikoscenarioOvrigeRisikoscenarierLink'
import { KravRisikoscenarioReadMore } from '../common/kravRisikoscenarioReadMore'
import KravRisikoscenarioAccordionContentReadOnly from './kravRisikoscenarioAccordionContentReadOnly'

type TProps = {
  krav: TKravQL
  pvkDokument: IPvkDokument
}

export const KravRisikoscenarioReadOnly: FunctionComponent<TProps> = ({ krav, pvkDokument }) => {
  const [alleRisikoscenarioer, setAlleRisikoscenarioer] = useState<IRisikoscenario[]>([])
  const [risikoscenarioForKrav, setRisikoscenarioForKrav] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])

  const user = useContext(UserContext)

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
          <KravRisikoscenarioOvrigeRisikoscenarierLink pvkDokument={pvkDokument} pvoLink />
        )}
      </div>
    </div>
  )
}

export default KravRisikoscenarioReadOnly

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
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { Accordion, Alert } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import NyttInnholdTag from '../common/NyttInnholdTag'
import { KravRisikoscenarioOvrigeRisikoscenarierLink } from '../common/kravRisikoscenarioOvrigeRisikoscenarierLink'
import { KravRisikoscenarioReadMore } from '../common/kravRisikoscenarioReadMore'
import KravRisikoscenarioAccordionContentReadOnly from './kravRisikoscenarioAccordionContentReadOnly'

type TProps = {
  krav: TKravQL
  pvkDokument: IPvkDokument
  previousVurdering?: IVurdering
}

export const KravRisikoscenarioReadOnly: FunctionComponent<TProps> = ({
  krav,
  pvkDokument,
  previousVurdering,
}) => {
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
            {risikoscenarioForKrav.map((risikoscenario: IRisikoscenario, index: number) => {
              const hasNewScenarioContent =
                user.isPersonvernombud() &&
                !!previousVurdering?.sendtDato &&
                moment(risikoscenario.changeStamp.lastModifiedDate).isAfter(
                  previousVurdering.sendtDato
                )

              const hasNewTiltakContent =
                user.isPersonvernombud() &&
                !!previousVurdering?.sendtDato &&
                tiltakList
                  .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                  .some((tiltak: ITiltak) =>
                    moment(tiltak.changeStamp.lastModifiedDate).isAfter(previousVurdering.sendtDato)
                  )

              const hasNewContent = hasNewScenarioContent || hasNewTiltakContent

              return (
                <Accordion.Item id={risikoscenario.id} key={`${index}_${risikoscenario.navn}`}>
                  <Accordion.Header id={risikoscenario.id}>
                    <div className='flex items-center gap-2'>
                      {risikoscenario.navn}
                      {hasNewContent && <NyttInnholdTag />}
                    </div>
                  </Accordion.Header>
                  <Accordion.Content>
                    <KravRisikoscenarioAccordionContentReadOnly
                      risikoscenario={risikoscenario}
                      alleRisikoscenarioer={alleRisikoscenarioer}
                      tiltakList={tiltakList}
                      previousVurdering={previousVurdering}
                    />
                  </Accordion.Content>
                </Accordion.Item>
              )
            })}
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

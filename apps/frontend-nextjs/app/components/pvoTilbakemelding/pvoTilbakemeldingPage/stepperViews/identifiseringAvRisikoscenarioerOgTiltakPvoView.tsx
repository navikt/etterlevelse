'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { IdentifiseringAvRisikoscenarioerOgTiltakContent } from '@/components/PVK/pvkDokumentPage/stepperViews/identifiseringAvRisikoscenarioerOgTiltak/identifiseringAvRisikoscenarioerOgTiltakContent'
import RisikoscenarioAccordianListReadOnlyView from '@/components/risikoscenario/readOnly/risikoscenarioAccordianListReadOnlyView'
import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { FunctionComponent, useEffect, useState } from 'react'
import PvoFormButtons from '../../form/pvoFormButtons'

type TProps = {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const IdentifiseringAvRisikoscenarioerOgTiltakPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
}) => {
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [allRisikoscenarioList, setAllRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])

  useEffect(() => {
    if (pvkDokument) {
      ;(async () => {
        await getRisikoscenarioByPvkDokumentId(pvkDokument.id, ERisikoscenarioType.ALL).then(
          (risikoscenarioer: IPageResponse<IRisikoscenario>) => {
            setAllRisikoscenarioList(risikoscenarioer.content)
            setRisikoscenarioList(
              risikoscenarioer.content.filter(
                (risikoscenario: IRisikoscenario) => risikoscenario.generelScenario
              )
            )
          }
        )
        await getTiltakByPvkDokumentId(pvkDokument.id).then((response: IPageResponse<ITiltak>) => {
          setTiltakList(response.content)
        })
      })()
    }
  }, [pvkDokument])

  return (
    <div className='flex justify-center w-full'>
      <div className='pt-6 flex-col justify-items-center'>
        <IdentifiseringAvRisikoscenarioerOgTiltakContent
          stylingHeading='mb-5'
          etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
          risikoscenarioList={risikoscenarioList}
        />

        <div className='w-full'>
          {risikoscenarioList.length !== 0 && (
            <div className='my-5'>
              <RisikoscenarioAccordianListReadOnlyView
                risikoscenarioList={risikoscenarioList}
                allRisikoscenarioList={allRisikoscenarioList}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                tiltakList={tiltakList}
              />
            </div>
          )}
        </div>

        <PvoFormButtons
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltakPvoView

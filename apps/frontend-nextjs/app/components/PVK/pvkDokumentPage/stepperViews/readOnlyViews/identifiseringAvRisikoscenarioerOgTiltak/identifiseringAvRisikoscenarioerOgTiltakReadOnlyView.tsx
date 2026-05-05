'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { RisikoscenarioAccordianListReadOnlyView } from '@/components/risikoscenario/readOnly/risikoscenarioAccordianListReadOnlyView'
import { IPageResponse } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { FunctionComponent, useEffect, useState } from 'react'
import InfoChangesMadeAfterApproval from '../../../../common/infoChangesMadeAfterApproval'
import FormButtons from '../../../../edit/formButtons'
import { IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyContent } from './identifiseringAvRisikoscenarioerOgTiltakReadOnlyContent'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
}

export const IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
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
      <div className='flex-col justify-items-center'>
        <IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyContent
          stylingHeading='my-5'
          risikoscenarioList={risikoscenarioList}
          antallInnsendingerTilPvo={pvkDokument?.antallInnsendingTilPvo}
          alertChangesMadeAfterApproval={
            <InfoChangesMadeAfterApproval
              pvkDokument={pvkDokument}
              alleRisikoscenario={allRisikoscenarioList}
              alleTiltak={tiltakList}
            />
          }
        />

        {pvkDokument && (
          <div className='w-full my-5'>
            <RisikoscenarioAccordianListReadOnlyView
              risikoscenarioList={risikoscenarioList}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
              allRisikoscenarioList={allRisikoscenarioList}
              tiltakList={tiltakList}
            />
          </div>
        )}

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyView

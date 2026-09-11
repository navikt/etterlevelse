'use client'

import { useLastApprovedRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { useLastApprovedTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import { RisikoscenarioAccordianListReadOnlyView } from '@/components/risikoscenario/readOnly/risikoscenarioAccordianListReadOnlyView'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
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
  const [allRisikoscenarioList, risikoscenarioList] = useLastApprovedRisikoscenarioByPvkDokumentId(
    pvkDokument,
    true
  )
  const [tiltakList] = useLastApprovedTiltakByPvkDokumentId(pvkDokument)

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

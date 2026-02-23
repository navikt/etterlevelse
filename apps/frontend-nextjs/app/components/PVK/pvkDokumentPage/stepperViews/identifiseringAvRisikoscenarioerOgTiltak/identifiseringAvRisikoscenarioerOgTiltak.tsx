'use client'

import { getRisikoscenarioByPvkDokumentId } from '@/api/risikoscenario/risikoscenarioApi'
import { getTiltakByPvkDokumentId } from '@/api/tiltak/tiltakApi'
import CreateRisikoscenarioModal from '@/components/risikoscenario/edit/createRisikoscenarioModal'
import RisikoscenarioAccordianList from '@/components/risikoscenario/generellScenario/risikoscenarioAccordianList'
import { RisikoscenarioAccordianListReadOnlyView } from '@/components/risikoscenario/readOnly/risikoscenarioAccordianListReadOnlyView'
import { IPageResponse } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  ERisikoscenarioType,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import InfoChangesMadeAfterApproval from '../../../common/infoChangesMadeAfterApproval'
import FormButtons from '../../../edit/formButtons'
import { IdentifiseringAvRisikoscenarioerOgTiltakContent } from './identifiseringAvRisikoscenarioerOgTiltakContent'

type TProps = {
  etterlevelseDokumentasjonId: string
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const IdentifiseringAvRisikoscenarioerOgTiltak: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [risikoscenarioList, setRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [allRisikoscenarioList, setAllRisikoscenarioList] = useState<IRisikoscenario[]>([])
  const [tiltakList, setTiltakList] = useState<ITiltak[]>([])
  const [isTiltakFormActive, setIsTiltakFormActive] = useState<boolean>(false)
  const [isIngenTilgangFormDirty, setIsIngenTilgangFormDirty] = useState<boolean>(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

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
        <IdentifiseringAvRisikoscenarioerOgTiltakContent
          stylingHeading='my-5'
          etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
          risikoscenarioList={risikoscenarioList}
          antallInnsendingerTilPvo={pvkDokument?.antallInnsendingTilPvo}
        />

        {pvkDokument && !isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='w-full'>
            {risikoscenarioList.length !== 0 && (
              <div className='my-5'>
                <RisikoscenarioAccordianList
                  risikoscenarioList={risikoscenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  setAllRisikoscenarioList={setAllRisikoscenarioList}
                  tiltakList={tiltakList}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  setTiltakList={setTiltakList}
                  setRisikoscenarioList={setRisikoscenarioList}
                  setIsTiltakFormActive={setIsTiltakFormActive}
                  isIngenTilgangFormDirty={isIngenTilgangFormDirty}
                  setIsIngenTilgangFormDirty={setIsIngenTilgangFormDirty}
                  formRef={formRef}
                  isCreateModalOpen={isCreateModalOpen}
                />
              </div>
            )}

            {!isTiltakFormActive && (
              <CreateRisikoscenarioModal
                pvkDokument={pvkDokument}
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                formRef={formRef}
                onSubmitStateUpdate={(risikoscenario: IRisikoscenario) => {
                  setRisikoscenarioList([...risikoscenarioList, risikoscenario])
                }}
                setIsIngenTilgangFormDirty={setIsIngenTilgangFormDirty}
              />
            )}
          </div>
        )}

        {pvkDokument && isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='w-full my-5'>
            <RisikoscenarioAccordianListReadOnlyView
              risikoscenarioList={risikoscenarioList}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
              allRisikoscenarioList={allRisikoscenarioList}
              tiltakList={tiltakList}
            />
          </div>
        )}

        {/* {pvkDokument && pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER && (
          <div className='w-full my-5'>
            <RisikoscenarioAccordianListReadOnlyWithIverksetting
              risikoscenarioList={risikoscenarioList}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
              allRisikoscenarioList={allRisikoscenarioList}
              tiltakList={tiltakList}
              setTiltakList={setTiltakList}
            />
          </div>
        )} */}

        <InfoChangesMadeAfterApproval
          pvkDokument={pvkDokument}
          alleRisikoscenario={allRisikoscenarioList}
          alleTiltak={tiltakList}
        />

        <FormButtons
          etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setSelectedStep={setSelectedStep}
        />
      </div>
    </div>
  )
}

export default IdentifiseringAvRisikoscenarioerOgTiltak

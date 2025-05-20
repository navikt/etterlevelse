import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { getRisikoscenarioByPvkDokumentId } from '../../api/RisikoscenarioApi'
import { getTiltakByPvkDokumentId } from '../../api/TiltakApi'
import {
  EPvkDokumentStatus,
  ERisikoscenarioType,
  IPageResponse,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
} from '../../constants'
import RisikoscenarioAccordianList from '../risikoscenario/RisikoscenarioAccordianList'
import CreateRisikoscenarioModal from '../risikoscenario/edit/CreateRisikoscenarioModal'
import RisikoscenarioAccordianListReadOnlyView from '../risikoscenario/readOnly/RisikoscenarioAccordianListReadOnlyView'
import { IdentifiseringAvRisikoscenarioerOgTiltakContent } from './common/IdentifiseringAvRisikoscenarioerOgTiltakContent'
import FormButtons from './edit/FormButtons'

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
        />

        {pvkDokument && pvkDokument.status !== EPvkDokumentStatus.PVO_UNDERARBEID && (
          <div className='w-full'>
            {risikoscenarioList.length !== 0 && (
              <div className='my-5'>
                <RisikoscenarioAccordianList
                  risikoscenarioList={risikoscenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  tiltakList={tiltakList}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  setTiltakList={setTiltakList}
                  setRisikoscenarioList={setRisikoscenarioList}
                  setIsTiltakFormActive={setIsTiltakFormActive}
                  formRef={formRef}
                />
              </div>
            )}

            {!isTiltakFormActive && (
              <CreateRisikoscenarioModal
                pvkDokument={pvkDokument}
                onSubmitStateUpdate={(risikoscenario: IRisikoscenario) => {
                  setRisikoscenarioList([...risikoscenarioList, risikoscenario])
                }}
              />
            )}
          </div>
        )}

        {pvkDokument && pvkDokument.status === EPvkDokumentStatus.PVO_UNDERARBEID && (
          <div className='w-full'>
            <RisikoscenarioAccordianListReadOnlyView
              risikoscenarioList={risikoscenarioList}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
              allRisikoscenarioList={allRisikoscenarioList}
              tiltakList={tiltakList}
            />
          </div>
        )}

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

import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button, Link } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useState } from 'react'
import { getPvkDokument } from '../../../api/PvkDokumentApi'
import { updateRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario, ITiltak } from '../../../constants'
import AlertPvoUnderarbeidModal from '../../PvkDokument/common/AlertPvoUnderarbeidModal'
import { isReadOnlyPvkStatus } from '../../PvkDokument/common/util'
import { pvkDokumentasjonStepUrl } from '../../common/RouteLinkPvk'
import RisikoscenarioView from '../RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../common/KravRisikoscenarioHeaders'
import RisikoscenarioModalForm from '../edit/RisikoscenarioModalForm'
import VurdereTiltaksEffekt from '../edit/VurdereTiltaksEffekt'
import TiltakReadMoreListModalEdit from './TiltakReadMoreListModalEdit'

type TProps = {
  risikoscenario: IRisikoscenario
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  formRef: RefObject<any>
}

export const OppsumeringAccordianContent: FunctionComponent<TProps> = ({
  risikoscenario,
  risikoscenarioList,
  etterlevelseDokumentasjonId,
  setRisikosenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  tiltakList,
  setTiltakList,
  formRef,
}) => {
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await updateRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
      window.location.reload()
    })
  }

  const activeFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  const ferdigBeskrevet: boolean =
    risikoscenario.konsekvensNivaa !== 0 &&
    risikoscenario.sannsynlighetsNivaa !== 0 &&
    risikoscenario.konsekvensNivaaBegrunnelse !== '' &&
    risikoscenario.sannsynlighetsNivaaBegrunnelse !== ''

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        stepUrl='7'
      />

      <div className='mt-5 flex gap-2 items-center'>
        <Button
          variant={ferdigBeskrevet ? 'tertiary' : 'primary'}
          type='button'
          icon={<PencilIcon aria-hidden />}
          onClick={async () => {
            await activeFormButton(() => setIsEditModalOpen(true))
          }}
        >
          Redigèr risikoscenario
        </Button>
      </div>
      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />

        <TiltakReadMoreListModalEdit
          risikoscenario={risikoscenario}
          tiltakList={tiltakList}
          allRisikoscenarioList={allRisikoscenarioList}
          setTiltakList={setTiltakList}
        />

        {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
          <div className='mt-5'>
            <Alert className='mt-3' variant='warning'>
              <span>
                Før dere kan vurdere tiltakenes effekt, må dere{' '}
                {!risikoscenario.generelScenario && 'legge inn tiltak på kravsiden.'}
                {risikoscenario.generelScenario && (
                  <Link
                    href={pvkDokumentasjonStepUrl(
                      etterlevelseDokumentasjonId,
                      risikoscenario.pvkDokumentId,
                      6,
                      `?risikoscenario=${risikoscenario.id}`
                    )}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='redigere etterlevelsesdokumentasjon'
                    className='inline'
                  >
                    legge inn tiltak under Identifisering av risikoscenarioer og tiltak. (åpner i en
                    ny fane).
                  </Link>
                )}
              </span>
            </Alert>
          </div>
        )}

        {!risikoscenario.ingenTiltak && (
          <div className='mt-5'>
            {risikoscenario.tiltakIds.length !== 0 && (
              <div>
                <VurdereTiltaksEffekt
                  risikoscenario={activeRisikoscenario}
                  setRisikoscenario={setActiveRisikoscenario}
                  risikoscenarioList={risikoscenarioList}
                  setRisikosenarioList={setRisikosenarioList}
                  allRisikoscenarioList={allRisikoscenarioList}
                  setAllRisikoscenarioList={setAllRisikoscenarioList}
                  formRef={formRef}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText='Redigér øvrig risikoscenario'
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
      )}

      {isPvoAlertModalOpen && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}
    </div>
  )
}

export default OppsumeringAccordianContent

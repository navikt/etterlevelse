import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, Modal, ReadMore } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { removeTiltakToRisikoscenario } from '../../api/RisikoscenarioApi'
import { deleteTiltak, getTiltak, updateTiltak } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'
import TiltakView from './TiltakView'
import TiltakForm from './edit/TiltakForm'

interface IProps {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  setIsEditTiltakFormActive: (state: boolean) => void
  isCreateTiltakFormActive: boolean
  formRef?: RefObject<any>
}

export const TiltakReadMoreList = (props: IProps) => {
  const {
    risikoscenario,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    formRef,
  } = props
  const [activeTiltak, setActiveTiltak] = useState<string>('')

  return (
    <div>
      {tiltakList
        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
        .map((tiltak, index) => {
          return (
            <div className="mt-3" key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              <TiltakListContent
                activeTiltak={activeTiltak}
                setActiveTiltak={setActiveTiltak}
                risikoscenario={risikoscenario}
                tiltak={tiltak}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
                risikoscenarioList={risikoscenarioList}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
                formRef={formRef}
              />
            </div>
          )
        })}
    </div>
  )
}

interface ITiltakListContentProps extends IProps {
  activeTiltak: string
  setActiveTiltak: (state: string) => void
  tiltak: ITiltak
}

const TiltakListContent = (props: ITiltakListContentProps) => {
  const {
    activeTiltak,
    setActiveTiltak,
    risikoscenario,
    tiltak,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    formRef,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  const submit = async (submitedValues: ITiltak) => {
    await updateTiltak(submitedValues).then((response) => {
      setTiltakList(
        tiltakList.map((tiltak) => {
          if (tiltak.id === response.id) {
            return { ...response }
          } else {
            return tiltak
          }
        })
      )
      setIsEditMode(false)
    })
  }

  const onDeleteSubmit = async (tiltakId: string) => {
    await getTiltak(tiltakId).then(async (response) => {
      if (
        response.risikoscenarioIds.length === 1 &&
        response.risikoscenarioIds[0] === risikoscenario.id
      ) {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(async () => {
          await deleteTiltak(tiltakId).then(() => {
            setIsDeleteModalOpen(false)
            window.location.reload()
          })
        })
      } else {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(() => {
          setIsDeleteModalOpen(false)
          window.location.reload()
        })
      }
    })
  }

  return (
    <div key={risikoscenario.id + '_' + tiltak.id}>
      {!isEditMode && (
        <ReadMore
          open={activeTiltak === tiltak.id}
          onOpenChange={(open) => {
            if (open) {
              setActiveTiltak(tiltak.id)
            } else {
              setActiveTiltak('')
            }
          }}
          header={tiltak.navn}
        >
          <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
        </ReadMore>
      )}

      {isEditMode && (
        <TiltakForm
          title="Redigér tiltak"
          initialValues={tiltak}
          pvkDokumentId={tiltak.pvkDokumentId}
          submit={submit}
          close={() => {
            setIsEditMode(false)
            setIsEditTiltakFormActive(false)
          }}
          formRef={formRef}
        />
      )}

      {activeTiltak === tiltak.id && !isEditMode && !isCreateTiltakFormActive && (
        <div className="flex gap-2 mt-5">
          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={<PencilIcon title="" aria-hidden />}
            onClick={() => {
              setIsEditTiltakFormActive(true)
              setIsEditMode(true)
            }}
          >
            Redigér tiltak
          </Button>

          <Button
            type="button"
            variant="tertiary"
            size="small"
            icon={<TrashIcon title="" aria-hidden />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Slett tiltak
          </Button>
        </div>
      )}

      {isDeleteModalOpen && (
        <Modal
          open={isDeleteModalOpen}
          header={{ heading: 'Slette tiltak fra risikoscenario' }}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Modal.Body>Er du sikkert på at du vil slette tiltaket?</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setIsDeleteModalOpen(false)} variant={'secondary'}>
              Avbryt
            </Button>
            <Button onClick={() => onDeleteSubmit(tiltak.id)}>Slett</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default TiltakReadMoreList

'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { updateTiltak } from '@/api/tiltak/tiltakApi'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoscenarioTiltakUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { Button, ReadMore } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RefObject, useEffect, useState } from 'react'
import AlertPvoUnderArbeidModal from '../pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import TiltakView from './common/tiltakView'
import SlettTiltakModal from './edit/slettTiltakModal'
import TiltakForm from './form/tiltakForm'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  setIsEditTiltakFormActive: (state: boolean) => void
  isCreateTiltakFormActive: boolean
  isAddExistingMode: boolean
  customDelete?: (tiltakId: string) => void
  formRef?: RefObject<any>
}

export const TiltakReadMoreList = (props: IProps) => {
  const {
    risikoscenario,
    setRisikoscenario: setRirikoscenario,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setRisikoscenarioList,
    risikoscenarioer,
    setRisikoscenarioer,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    isAddExistingMode,
    customDelete,
    formRef,
  } = props
  const [activeTiltak, setActiveTiltak] = useState<string>('')
  const queryParams = useSearchParams()
  const tiltakId = queryParams.get('tiltak')

  useEffect(() => {
    if (tiltakId) {
      setActiveTiltak(tiltakId)
    }
  }, [tiltakId])

  return (
    <div>
      {tiltakList
        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
        .map((tiltak, index) => {
          return (
            <div className='mt-3' key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              <TiltakListContent
                activeTiltak={activeTiltak}
                setActiveTiltak={setActiveTiltak}
                risikoscenario={risikoscenario}
                setRisikoscenario={setRirikoscenario}
                tiltak={tiltak}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
                risikoscenarioList={risikoscenarioList}
                setRisikoscenarioList={setRisikoscenarioList}
                risikoscenarioer={risikoscenarioer}
                setRisikoscenarioer={setRisikoscenarioer}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
                isAddExistingMode={isAddExistingMode}
                customDelete={customDelete}
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
    setRisikoscenario,
    tiltak,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setRisikoscenarioList,
    risikoscenarioer,
    setRisikoscenarioer,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    isAddExistingMode,
    customDelete,
    formRef,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [risikoscenarioerConnectedToTiltak, setRisikoscenarioerConnectedToTiltak] = useState<
    string[]
  >([])
  const queryParams = useSearchParams()
  const tiltakId = queryParams.get('tiltak')
  const steg = queryParams.get('steg') || undefined
  const router = useRouter()

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
      setIsEditTiltakFormActive(false)
      setIsEditMode(false)
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

  useEffect(() => {
    if (tiltak && tiltak.id === activeTiltak) {
      const risikoscenarioIds = tiltak.risikoscenarioIds.filter((id) => id !== risikoscenario.id)
      const risikoscenarioNameList: string[] = []
      risikoscenarioIds.forEach((id) => {
        risikoscenarioNameList.push(
          risikoscenarioList.filter((risikoscenario) => risikoscenario.id === id)[0].navn
        )
      })
      setRisikoscenarioerConnectedToTiltak(risikoscenarioNameList)
    }
  }, [activeTiltak])

  return (
    <div key={risikoscenario.id + '_' + tiltak.id}>
      {!isEditMode && (
        <ReadMore
          open={tiltakId === tiltak.id}
          id={risikoscenario.id + '_' + tiltak.id}
          className='mb-3'
          onOpenChange={(open) => {
            if (open) {
              setActiveTiltak(tiltak.id)
              router.push(risikoscenarioTiltakUrl(risikoscenario.id, tiltak.id, steg), {
                scroll: false,
              })
            } else {
              setActiveTiltak('')
              router.push(risikoscenarioUrl(risikoscenario.id, steg), { scroll: false })
            }
          }}
          header={tiltak.navn}
        >
          <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
        </ReadMore>
      )}

      <div>
        {isEditMode && (
          <TiltakForm
            title='Rediger tiltak'
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

        {activeTiltak === tiltak.id &&
          !isEditMode &&
          !isCreateTiltakFormActive &&
          !isAddExistingMode && (
            <div className='flex gap-2 mt-5'>
              <Button
                type='button'
                variant='tertiary'
                size='small'
                icon={<PencilIcon title='' aria-hidden />}
                onClick={async () => {
                  await activeFormButton(() => {
                    setIsEditTiltakFormActive(true)
                    setIsEditMode(true)
                  })
                }}
              >
                Rediger tiltak
              </Button>

              <Button
                type='button'
                variant='tertiary'
                size='small'
                icon={<TrashIcon title='' aria-hidden />}
                onClick={async () => {
                  await activeFormButton(() => setIsDeleteModalOpen(true))
                }}
              >
                Slett tiltak
              </Button>
            </div>
          )}
      </div>

      {isPvoAlertModalOpen && (
        <AlertPvoUnderArbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}

      {isDeleteModalOpen && (
        <SlettTiltakModal
          tiltak={tiltak}
          risikoscenario={risikoscenario}
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          risikoscenarioerConnectedToTiltak={risikoscenarioerConnectedToTiltak}
          setRisikoscenario={setRisikoscenario}
          tiltakList={tiltakList}
          setTiltakList={setTiltakList}
          risikoscenarioList={risikoscenarioList}
          setRisikoscenarioList={setRisikoscenarioList}
          risikoscenarioer={risikoscenarioer}
          setRisikoscenarioer={setRisikoscenarioer}
          customDelete={customDelete}
        />
      )}
    </div>
  )
}

export default TiltakReadMoreList

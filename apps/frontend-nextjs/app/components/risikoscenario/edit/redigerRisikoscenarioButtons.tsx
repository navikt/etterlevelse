'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderxArbeidModal'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { PencilIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import FjernRisikoscenarioFraKrav from './fjernRisikoscenarioFraKrav'

type TProps = {
  setIsEditModalOpen: (value: React.SetStateAction<boolean>) => void
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
}

export const RedigerRisikoscenarioButtons: FunctionComponent<TProps> = ({
  setIsEditModalOpen,
  kravnummer,
  risikoscenario,
  risikoscenarioer,
  setRisikoscenarioer,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
  tiltakList,
  setTiltakList,
}) => {
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const activateFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  return (
    <div className='mt-5'>
      <Button
        variant='tertiary'
        type='button'
        icon={<PencilIcon aria-hidden />}
        onClick={async () => await activateFormButton(() => setIsEditModalOpen(true))}
        className='mb-2'
      >
        Redigèr risikoscenario
      </Button>

      <FjernRisikoscenarioFraKrav
        kravnummer={kravnummer}
        risikoscenario={risikoscenario}
        risikoscenarioer={risikoscenarioer}
        setRisikoscenarioer={setRisikoscenarioer}
        risikoscenarioForKrav={risikoscenarioForKrav}
        setRisikoscenarioForKrav={setRisikoscenarioForKrav}
        tiltakList={tiltakList}
        setTiltakList={setTiltakList}
      />

      {isPvoAlertModalOpen && (
        <AlertPvoUnderArbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}
    </div>
  )
}

export default RedigerRisikoscenarioButtons

import { Alert } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { IPvkDokument, IRisikoscenario, ITiltak } from '../../../constants'

type TProps = {
  pvkDokument: IPvkDokument
  alleRisikoscenario?: IRisikoscenario[]
  alleTiltak?: ITiltak[]
}

export const InfoChangesMadeAfterApproval: FunctionComponent<TProps> = ({
  pvkDokument,
  alleRisikoscenario,
  alleTiltak,
}) => {
  const [isChangesMade, setIsChangesMade] = useState<boolean>(false)

  useEffect(() => {
    if (
      pvkDokument.godkjentAvRisikoeierDato !== '' &&
      pvkDokument.godkjentAvRisikoeierDato !== null &&
      pvkDokument.godkjentAvRisikoeierDato !== undefined
    ) {
      let lastModifiedDate = pvkDokument.changeStamp.lastModifiedDate

      if (alleRisikoscenario && alleRisikoscenario.length !== 0) {
        const sortedRisikoscenario = alleRisikoscenario.sort((a, b) =>
          a.changeStamp.lastModifiedDate.localeCompare(b.changeStamp.lastModifiedDate)
        )

        if (sortedRisikoscenario[0].changeStamp.lastModifiedDate > lastModifiedDate) {
          lastModifiedDate = sortedRisikoscenario[0].changeStamp.lastModifiedDate
        }
      }

      if (alleTiltak && alleTiltak.length !== 0) {
        const sortedTitlak = alleTiltak.sort((a, b) =>
          a.changeStamp.lastModifiedDate.localeCompare(b.changeStamp.lastModifiedDate)
        )

        if (sortedTitlak[0].changeStamp.lastModifiedDate > lastModifiedDate) {
          lastModifiedDate = sortedTitlak[0].changeStamp.lastModifiedDate
        }
      }

      if (lastModifiedDate > pvkDokument.godkjentAvRisikoeierDato) {
        setIsChangesMade(true)
      }
    }
  }, [pvkDokument])

  return (
    <>
      {isChangesMade && (
        <Alert variant='info'>
          Denne PVK-en har blitt endret siden den ble godkjent og arkivert av risikoeieren{' '}
          {pvkDokument.godkjentAvRisikoeierDato}
        </Alert>
      )}
    </>
  )
}
export default InfoChangesMadeAfterApproval

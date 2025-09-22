import { Alert } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useEffect, useState } from 'react'
import {
  EPvkDokumentStatus,
  IBehandlingensLivslop,
  IPvkDokument,
  IRisikoscenario,
  ITiltak,
} from '../../../constants'

type TProps = {
  pvkDokument: IPvkDokument
  alleRisikoscenario?: IRisikoscenario[]
  alleTiltak?: ITiltak[]
  behandlingensLivslop?: IBehandlingensLivslop
}

export const InfoChangesMadeAfterApproval: FunctionComponent<TProps> = ({
  pvkDokument,
  alleRisikoscenario,
  alleTiltak,
  behandlingensLivslop,
}) => {
  const [isChangesMade, setIsChangesMade] = useState<boolean>(false)
  const [approvedDate, setApprovedDate] = useState<string>('')
  const [approvedTime, setApprovedTime] = useState<string>('')

  useEffect(() => {
    if (
      pvkDokument.godkjentAvRisikoeierDato !== '' &&
      pvkDokument.godkjentAvRisikoeierDato !== null &&
      pvkDokument.godkjentAvRisikoeierDato !== undefined
    ) {
      let lastModifiedDate = moment(pvkDokument.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)

      if (
        behandlingensLivslop &&
        behandlingensLivslop.changeStamp &&
        moment(behandlingensLivslop.changeStamp.lastModifiedDate)
          .seconds(0)
          .milliseconds(0)
          .isAfter(lastModifiedDate)
      ) {
        lastModifiedDate = moment(behandlingensLivslop.changeStamp.lastModifiedDate)
          .seconds(0)
          .milliseconds(0)
      }

      if (alleRisikoscenario && alleRisikoscenario.length !== 0) {
        const sortedRisikoscenario = alleRisikoscenario.sort((a, b) =>
          b.changeStamp.lastModifiedDate.localeCompare(a.changeStamp.lastModifiedDate)
        )

        if (
          moment(sortedRisikoscenario[0].changeStamp.lastModifiedDate)
            .seconds(0)
            .milliseconds(0)
            .isAfter(lastModifiedDate)
        ) {
          lastModifiedDate = moment(sortedRisikoscenario[0].changeStamp.lastModifiedDate)
            .seconds(0)
            .milliseconds(0)
        }
      }

      if (alleTiltak && alleTiltak.length !== 0) {
        const sortedTitlak = alleTiltak.sort((a, b) =>
          b.changeStamp.lastModifiedDate.localeCompare(a.changeStamp.lastModifiedDate)
        )

        if (
          moment(sortedTitlak[0].changeStamp.lastModifiedDate)
            .seconds(0)
            .milliseconds(0)
            .isAfter(lastModifiedDate)
        ) {
          lastModifiedDate = moment(sortedTitlak[0].changeStamp.lastModifiedDate)
            .seconds(0)
            .milliseconds(0)
        }
      }

      if (
        pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
        lastModifiedDate.isAfter(
          moment(pvkDokument.godkjentAvRisikoeierDato).seconds(0).milliseconds(0)
        )
      ) {
        setIsChangesMade(true)
        const godkjentDatoOgTid = pvkDokument.godkjentAvRisikoeierDato.split('T')
        const tid = godkjentDatoOgTid[1].split(':')
        setApprovedDate(godkjentDatoOgTid[0])
        setApprovedTime(tid[0] + ':' + tid[1])
      }
    }
  }, [pvkDokument, behandlingensLivslop, alleRisikoscenario, alleTiltak])

  return (
    <>
      {isChangesMade && (
        <Alert variant='info' className='mt-5'>
          Denne PVK-en har blitt endret siden den ble godkjent og arkivert av risikoeieren{' '}
          <strong>
            {moment(approvedDate).format('LL')} kl. {approvedTime}
          </strong>
        </Alert>
      )}
    </>
  )
}
export default InfoChangesMadeAfterApproval

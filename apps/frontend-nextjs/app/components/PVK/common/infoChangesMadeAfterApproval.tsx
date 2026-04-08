'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { InformationSquareIcon } from '@navikt/aksel-icons'
import { InfoCard } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, useMemo } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  alleRisikoscenario?: IRisikoscenario[]
  alleTiltak?: ITiltak[]
  behandlingensLivslop?: IBehandlingensLivslop
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
}

export const InfoChangesMadeAfterApproval: FunctionComponent<TProps> = ({
  pvkDokument,
  alleRisikoscenario,
  alleTiltak,
  behandlingensLivslop,
  behandlingensArtOgOmfang,
}) => {
  const approvalInfo = useMemo(() => {
    if (!pvkDokument.godkjentAvRisikoeierDato) {
      return { isChangesMade: false, approvedDate: '', approvedTime: '' }
    }

    let lastModifiedDate = moment(pvkDokument.changeStamp.lastModifiedDate)
      .seconds(0)
      .milliseconds(0)

    if (
      behandlingensLivslop?.changeStamp &&
      moment(behandlingensLivslop.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)
        .isAfter(lastModifiedDate)
    ) {
      lastModifiedDate = moment(behandlingensLivslop.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)
    }

    if (
      behandlingensArtOgOmfang?.changeStamp &&
      moment(behandlingensArtOgOmfang.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)
        .isAfter(lastModifiedDate)
    ) {
      lastModifiedDate = moment(behandlingensArtOgOmfang.changeStamp.lastModifiedDate)
        .seconds(0)
        .milliseconds(0)
    }

    if (alleRisikoscenario && alleRisikoscenario.length !== 0) {
      const sortedRisikoscenario = [...alleRisikoscenario].sort((a, b) =>
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
      const sortedTitlak = [...alleTiltak].sort((a, b) =>
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

    const godkjentDatoOgTid = pvkDokument.godkjentAvRisikoeierDato.split('T')
    const tid = godkjentDatoOgTid[1].split(':')

    return {
      isChangesMade:
        pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
        lastModifiedDate.isAfter(
          moment(pvkDokument.godkjentAvRisikoeierDato).seconds(0).milliseconds(0)
        ),
      approvedDate: godkjentDatoOgTid[0],
      approvedTime: tid[0] + ':' + tid[1],
    }
  }, [pvkDokument, behandlingensLivslop, behandlingensArtOgOmfang, alleRisikoscenario, alleTiltak])

  return (
    <>
      {approvalInfo.isChangesMade && (
        <div>
          <InfoCard data-color='info' className='my-5 max-w-[75ch]' size='small'>
            <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
              <InfoCard.Title>
                Denne PVK-en har blitt endret siden den ble godkjent og arkivert av risikoeieren{' '}
                <strong>
                  {moment(approvalInfo.approvedDate).format('LL')} kl. {approvalInfo.approvedTime}
                </strong>
              </InfoCard.Title>
            </InfoCard.Header>
          </InfoCard>
        </div>
      )}
    </>
  )
}
export default InfoChangesMadeAfterApproval

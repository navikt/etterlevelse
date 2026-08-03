'use client'

import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Detail, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
}

const etterlevelseStatusToText = (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
  if (
    etterlevelseDokumentasjon.status ===
    EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
  ) {
    return 'Etterlevelse sendt til godkjenning'
  }

  if (
    etterlevelseDokumentasjon.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
  ) {
    const godkjentDato = moment(etterlevelseDokumentasjon.changeStamp.lastModifiedDate).format(
      'DD.MM.YY'
    )
    return `Etterlevelse godkjent ${godkjentDato}`
  }

  return 'Etterlevelse: Under arbeid'
}

const etterlevelseStatusToVariant = (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
  if (
    etterlevelseDokumentasjon.status ===
    EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
  ) {
    return 'info'
  }

  if (
    etterlevelseDokumentasjon.status === EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
  ) {
    return 'success'
  }

  return 'warning'
}

const pvkStatusToVariant = (pvkDokument: IPvkDokument) => {
  if (pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
    return 'success'
  }

  if (pvkDokument.status === EPvkDokumentStatus.UNDERARBEID) {
    return 'warning'
  }

  return 'info'
}

const pvkStatusToText = (pvkDokument: IPvkDokument) => {
  if (
    pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER &&
    pvkDokument.godkjentAvRisikoeierDato
  ) {
    const godkjentDato = moment(pvkDokument.godkjentAvRisikoeierDato).format('DD.MM.YY')
    return `PVK godkjent ${godkjentDato}`
  }

  return `PVK: ${pvkDokumentStatusToText(pvkDokument.status)}`
}

export const EtterlevelseDokumentasjonStatusTag: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
}) => (
  <div className='flex gap-2'>
    <Tag variant={etterlevelseStatusToVariant(etterlevelseDokumentasjon)} className='w-fit'>
      <Detail>{etterlevelseStatusToText(etterlevelseDokumentasjon)}</Detail>
    </Tag>

    {pvkDokument && (
      <Tag variant={pvkStatusToVariant(pvkDokument)} className='w-fit'>
        <Detail>{pvkStatusToText(pvkDokument)}</Detail>
      </Tag>
    )}
  </div>
)

export default EtterlevelseDokumentasjonStatusTag

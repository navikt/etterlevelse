import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { FunctionComponent } from 'react'
import {
  EtterleverGodkjentVariant,
  EtterleverSendtTilGodkjenningVariant,
  EtterleverUnderArbeidVariant,
} from '../commonEtterlevelse/etterleverCommon'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

const EtterleverRolle: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  switch (etterlevelseDokumentasjon.status) {
    case EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER:
      return (
        <EtterleverSendtTilGodkjenningVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    case EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER:
      return <EtterleverGodkjentVariant etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    default:
      return <EtterleverUnderArbeidVariant etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
  }
}

export default EtterleverRolle

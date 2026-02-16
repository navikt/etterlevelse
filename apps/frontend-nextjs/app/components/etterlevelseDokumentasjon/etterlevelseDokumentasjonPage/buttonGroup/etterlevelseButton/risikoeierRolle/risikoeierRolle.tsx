import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { FunctionComponent } from 'react'
import { EtterlevelseReadOnlyActionMenuVariant } from '../commonEtterlevelse/commonEtterlevelse'
import {
  EtterleverGodkjentVariant,
  EtterleverUnderArbeidVariant,
} from '../commonEtterlevelse/etterleverCommon'
import {
  RisikoeierGodkjenningAvEtterlevelseActionMenuVariant,
  RisikoeierOgEtterleverGodkjenningAvEtterlevelseActionMenuVariant,
} from '../commonEtterlevelse/risikoeierCommon'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

const RisikoeierRolle: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  switch (etterlevelseDokumentasjon.status) {
    case EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER:
      return (
        <RisikoeierGodkjenningAvEtterlevelseActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    default:
      return (
        <EtterlevelseReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
  }
}

export const RisikoeierOgEtterleverRolle: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  switch (etterlevelseDokumentasjon.status) {
    case EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER:
      return (
        <RisikoeierOgEtterleverGodkjenningAvEtterlevelseActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    case EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER:
      return <EtterleverGodkjentVariant etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    default:
      return <EtterleverUnderArbeidVariant etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
  }
}

export default RisikoeierRolle

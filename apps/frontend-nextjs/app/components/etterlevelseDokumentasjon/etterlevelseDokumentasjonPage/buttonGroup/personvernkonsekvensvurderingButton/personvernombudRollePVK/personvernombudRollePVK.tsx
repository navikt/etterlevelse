import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPVKTilstandStatus,
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  PvkIkkePabegyntActionMenuVariant,
  PvkOppdatertEtterNyVersjonActionMenuVariant,
  PvkPabegyntActionMenuVariant,
} from '../commonPVK/commonPVK'
import { PersonvernombudVariantOne } from '../commonPVK/personvernombudCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
}

const PersonvernombudRollePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
}) => {
  const getPvkTilstand = (): EPVKTilstandStatus => {
    if ((pvkDokument && pvkDokument.hasPvkDocumentationStarted === false) || !pvkDokument) {
      return EPVKTilstandStatus.TILSTAND_STATUS_ONE
    } else if (
      etterlevelseDokumentasjon.etterlevelseDokumentVersjon === 1 &&
      [EPvkDokumentStatus.SENDT_TIL_PVO, EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING].includes(
        pvkDokument.status
      )
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_FIVE
    } else if (
      etterlevelseDokumentasjon.etterlevelseDokumentVersjon > 1 &&
      [EPvkDokumentStatus.SENDT_TIL_PVO, EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING].includes(
        pvkDokument.status
      )
    ) {
      return EPVKTilstandStatus.TILSTAND_STATUS_TEN
    } else {
      return EPVKTilstandStatus.TILSTAND_STATUS_FOUR
    }
  }

  switch (getPvkTilstand()) {
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <PvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <PvkPabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <PersonvernombudVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <PvkOppdatertEtterNyVersjonActionMenuVariant />
    default:
      return <></>
  }
}

export default PersonvernombudRollePVK

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
import { PersonvernombudSendtForTilbakemeldingActionMenuVariant } from '../commonPVK/personvernombudCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument?: IPvkDokument
}

const PersonvernombudRollePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
}) => {
  const getPvkTilstand = (): EPVKTilstandStatus | string => {
    if ((pvkDokument && pvkDokument.hasPvkDocumentationStarted === false) || !pvkDokument) {
      // Will render same component for statuses [will not do pvk, will do pvk but documentation not yet started]
      // DVS  EPVKTilstandStatus.TILSTAND_STATUS_TWO,  EPVKTilstandStatus.TILSTAND_STATUS_THREE
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
      return 'default'
    }
  }

  switch (getPvkTilstand()) {
    // Will render same component for statuses [will not do pvk, will do pvk but documentation not yet started]
    // DVS  EPVKTilstandStatus.TILSTAND_STATUS_TWO,  EPVKTilstandStatus.TILSTAND_STATUS_THREE
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <PvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <PersonvernombudSendtForTilbakemeldingActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <PvkOppdatertEtterNyVersjonActionMenuVariant />
    default:
      return <PvkPabegyntActionMenuVariant />
  }
}

export default PersonvernombudRollePVK

import { EObjectType } from '@/constants/admin/audit/auditConstants'

export const objectTypeToOptions = (
  objectType: EObjectType | string
): { value: string; label: string } => {
  switch (objectType) {
    case 'Codelist':
      return { value: EObjectType.Codelist, label: 'Codelist' }
    case EObjectType.KravPriorityList:
      return { value: EObjectType.KravPriorityList, label: 'Krav priority list' }
    case EObjectType.ETTERLEVELSE:
      return { value: EObjectType.ETTERLEVELSE, label: 'Etterlevelse' }
    case EObjectType.KRAV:
      return { value: EObjectType.KRAV, label: 'Krav' }
    case EObjectType.Melding:
      return { value: EObjectType.Melding, label: 'Melding' }
    case EObjectType.ETTERLEVELSE_METADATA:
      return { value: EObjectType.ETTERLEVELSE_METADATA, label: 'Etterlevelse metadata' }
    case EObjectType.ETTERLEVELSE_DOKUMENTASJON:
      return { value: EObjectType.ETTERLEVELSE_DOKUMENTASJON, label: 'Etterlevelse dokumentasjon' }
    case EObjectType.PVK_DOKUMENT:
      return { value: EObjectType.PVK_DOKUMENT, label: 'Pvk dokument' }
    case EObjectType.PVO_TILBAKEMELDING:
      return { value: EObjectType.PVO_TILBAKEMELDING, label: 'Pvo tilbakemelding' }
    case EObjectType.BEHANDLINGENS_LIVSLOP:
      return { value: EObjectType.BEHANDLINGENS_LIVSLOP, label: 'Behandlingens livsløp' }
    case EObjectType.RISIKOSCENARIO:
      return { value: EObjectType.RISIKOSCENARIO, label: 'Risikoscenario' }
    case EObjectType.TILTAK:
      return { value: EObjectType.TILTAK, label: 'Tiltak' }
    case EObjectType.P360_ARCHIVE_DOCUMENT:
      return { value: EObjectType.P360_ARCHIVE_DOCUMENT, label: 'P360 archive document' }
    case EObjectType.Krav:
      return { value: EObjectType.Krav, label: 'Krav (Old data)' }
    case EObjectType.Etterlevelse:
      return { value: EObjectType.Etterlevelse, label: 'Etterlevelse (Old data)' }
    case EObjectType.EtterlevelseMetadata:
      return { value: EObjectType.EtterlevelseMetadata, label: 'EtterlevelseMetadata (Old data)' }
    case EObjectType.Behandling:
      return { value: EObjectType.Behandling, label: 'Behandling (Old data)' }
    case EObjectType.EtterlevelseDokumentasjon:
      return {
        value: EObjectType.EtterlevelseDokumentasjon,
        label: 'EtterlevelseDokumentasjon (Old data)',
      }
    case EObjectType.BehandlingData:
      return {
        value: EObjectType.BehandlingData,
        label: 'BehandlingData (Old data)',
      }
    case EObjectType.EtterlevelseArkiv:
      return {
        value: EObjectType.EtterlevelseArkiv,
        label: 'EtterlevelseArkiv (Old data)',
      }

    default:
      return { value: 'NULL', label: 'NULL' }
  }
}

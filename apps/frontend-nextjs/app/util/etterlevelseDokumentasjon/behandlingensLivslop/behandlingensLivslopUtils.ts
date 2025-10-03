import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'

export const getVariantForBLLButton = (
  behandlingsLivslop: IBehandlingensLivslop | undefined
): 'primary' | 'secondary' => {
  return (behandlingsLivslop && behandlingsLivslop?.filer.length > 0) ||
    behandlingsLivslop?.beskrivelse
    ? 'secondary'
    : 'primary'
}

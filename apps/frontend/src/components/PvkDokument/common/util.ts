import { EPvkDokumentStatus } from '../../../constants'

export const isReadOnlyPvkStatus = (status: string) => {
  return [
    EPvkDokumentStatus.PVO_UNDERARBEID.toString(),
    EPvkDokumentStatus.SENDT_TIL_PVO.toString(),
    EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING.toString(),
  ].includes(status)
}

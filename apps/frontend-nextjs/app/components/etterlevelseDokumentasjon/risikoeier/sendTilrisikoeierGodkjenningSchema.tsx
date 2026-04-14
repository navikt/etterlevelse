import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import * as yup from 'yup'

const meldingEtterlevelerTilRisikoeierCheck = yup.string().test({
  name: 'meldingEtterlevelerTilRisikoeierCheck',
  message: 'Dere må oppsummere for risikoeier hvorfor det er aktuelt med godkjenning',
  test: function (meldingEtterlevelerTilRisikoeier) {
    const { parent } = this
    if (
      parent.status !== EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
      ['', null, undefined].includes(meldingEtterlevelerTilRisikoeier)
    ) {
      return false
    }
    return true
  },
})

export const sendTilRisikoGodkjenningSchema = () =>
  yup.object({
    meldingEtterlevelerTilRisikoeier: meldingEtterlevelerTilRisikoeierCheck,
  })

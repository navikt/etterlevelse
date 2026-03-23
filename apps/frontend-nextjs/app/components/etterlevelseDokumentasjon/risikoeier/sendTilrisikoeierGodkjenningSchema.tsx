import * as yup from 'yup'

const meldingEtterlevelerTilRisikoeierCheck = yup
  .string()
  .required('Dere må oppsummere for risikoeier hvorfor det er aktuelt med godkjenning')

export const sendTilRisikoGodkjenningSchema = () =>
  yup.object({
    meldingEtterlevelerTilRisikoeier: meldingEtterlevelerTilRisikoeierCheck,
  })

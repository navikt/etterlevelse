import * as yup from 'yup'

export const risikoscenarioCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    beskrivelse: yup.string().required('Du må skrive en beskrivelse'),
    relevanteKravNummer: yup
      .array()
      .test({
        name: 'relevanteKravNummerOvrigCheck',
        message: 'Kan ikke sette til krav spesifikk scenario uten krav kobling',
        test: function (relevanteKravNummer) {
          const { parent } = this
          if (!parent.generelScenario) {
            return relevanteKravNummer && relevanteKravNummer.length !== 0
          } else {
            return true
          }
        },
      })
      .test({
        name: 'relevanteKravNummerKravSpesifikkCheck',
        message: 'Kan ikke sette til øvrig scenario med krav kobling',
        test: function (relevanteKravNummer) {
          const { parent } = this
          if (parent.generelScenario) {
            return relevanteKravNummer && relevanteKravNummer.length === 0
          } else {
            return true
          }
        },
      }),
  })

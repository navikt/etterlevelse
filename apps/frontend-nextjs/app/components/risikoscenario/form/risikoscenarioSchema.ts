import * as yup from 'yup'

export const risikoscenarioCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    beskrivelse: yup.string().required('Du må skrive en beskrivelse'),
    relevanteKravNummer: yup.array().test({
      name: 'relevanteKravNummerOvrigCheck',
      message: 'Dere må velge hvilke etterlevelseskrav dette risikoscenarioet skal kobles til',
      test: function (relevanteKravNummer) {
        const { parent } = this
        if (!parent.generelScenario) {
          return relevanteKravNummer && relevanteKravNummer.length !== 0
        } else {
          return true
        }
      },
    }),
  })

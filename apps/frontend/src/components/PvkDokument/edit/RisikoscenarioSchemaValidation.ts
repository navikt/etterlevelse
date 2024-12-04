import * as yup from 'yup'

export const risikoscenarioCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    sannsynlighetsNivaa: yup.number().test({
      name: 'sannsynlighetsNivaaCheck',
      message: 'Du må oppgi et sannsynlighetsnivå',
      test: function (sannsynlighetsNivaa) {
        return sannsynlighetsNivaa && sannsynlighetsNivaa > 0 ? true : false
      },
    }),
    konsekvensNivaa: yup.number().test({
      name: 'konsekvensNivaaCheck',
      message: 'Du må oppgi et konsekvensnivå',
      test: function (konsekvensNivaa) {
        return konsekvensNivaa && konsekvensNivaa > 0 ? true : false
      },
    }),
  })

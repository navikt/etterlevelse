import * as yup from 'yup'

export const risikoscenarioCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    beskrivelse: yup.string().required('Du må skrive en beskrivelse'),
  })

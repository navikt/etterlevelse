import * as yup from 'yup'

export const tiltakSchemaValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    beskrivelse: yup.string().required('Du må legge inn en tiltaksbeskrivelse'),
  })

import moment from 'moment'
import * as yup from 'yup'

export const tiltakSchemaValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til risikoscenario'),
    beskrivelse: yup.string().required('Du må skrive en beskrivelse'),
    frist: yup.string().test({
      name: 'frist',
      message: 'Tiltaksfristen kan ikke settes før dagens dato',
      test: function () {
        const { parent } = this
        if (parent.frist === undefined || parent.frist >= moment(new Date()).format('yyyy-MM-DD')) {
          return true
        }
        return false
      },
    }),
  })

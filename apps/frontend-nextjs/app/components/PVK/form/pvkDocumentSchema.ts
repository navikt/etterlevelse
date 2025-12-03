import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import * as yup from 'yup'

const editStatus = [
  EPvkDokumentStatus.SENDT_TIL_PVO,
  EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
  EPvkDokumentStatus.TRENGER_GODKJENNING,
]

const stringCheck = (fielName: string, errorMessage?: string) =>
  yup.string().test({
    name: fielName,
    message: errorMessage ? errorMessage : 'Dette er et påkrevd felt',
    test: function (stringField) {
      const { parent } = this
      if (editStatus.includes(parent.status)) {
        if (stringField === undefined || stringField === '') {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
  })

const boolCheck = (fieldName: string, errorMessage?: string) =>
  yup
    .boolean()
    .test({
      name: fieldName,
      message: errorMessage ? errorMessage : 'Dette er et påkrevd felt',
      test: function (boolField) {
        const { parent } = this
        if (editStatus.includes(parent.status)) {
          if (boolField === undefined || boolField === null) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    })
    .nullable()

export const pvkDocumentSchema = () => {
  return yup.object({
    harInvolvertRepresentant: boolCheck(
      'harInvolvertRepresentant',
      'Dere må oppgi om dere har involvert en representant for de registrerte.'
    ),

    representantInvolveringsBeskrivelse: stringCheck(
      'representantInvolveringsBeskrivelse',
      'Dere må beskrive nærmere valget om involvering av representanter for de registrerte.'
    ),

    harDatabehandlerRepresentantInvolvering: boolCheck(
      'harDatabehandlerRepresentantInvolvering',
      'Dere må oppgi om dere har involvert en representant for databehandlere.'
    ),

    dataBehandlerRepresentantInvolveringBeskrivelse: stringCheck(
      'dataBehandlerRepresentantInvolveringBeskrivelse',
      'Dere må beskrive nærmere valget om involvering av representanter for databehandlere.'
    ),
  })
}

export default pvkDocumentSchema

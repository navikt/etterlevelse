import * as yup from 'yup'
import { EPvkDokumentStatus } from '../../../constants'

const stringCheck = (fielName: string, errorMessage?: string) =>
  yup.string().test({
    name: fielName,
    message: errorMessage ? errorMessage : 'Dette er et påkrevd felt',
    test: function (stringField) {
      const { parent } = this
      if (
        parent.status !== EPvkDokumentStatus.UNDERARBEID &&
        parent.status !== EPvkDokumentStatus.AKTIV
      ) {
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
  yup.boolean().test({
    name: fieldName,
    message: errorMessage ? errorMessage : 'Dette er et påkrevd felt',
    test: function (boolField) {
      const { parent } = this
      if (
        parent.status !== EPvkDokumentStatus.UNDERARBEID &&
        parent.status !== EPvkDokumentStatus.AKTIV
      ) {
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

export const pvkDocumentSchema = () => {
  return yup.object({
    stemmerPersonkategorier: boolCheck('stemmerPersonkategorier'),

    personkategoriAntallBeskrivelse: stringCheck('personkategoriAntallBeskrivelse'),

    tilgangsBeskrivelsePersonopplysningene: stringCheck('tilgangsBeskrivelsePersonopplysningene'),

    lagringsBeskrivelsePersonopplysningene: stringCheck('lagringsBeskrivelsePersonopplysningene'),

    harInvolvertRepresentant: boolCheck('harInvolvertRepresentant'),

    representantInvolveringsBeskrivelse: stringCheck('representantInvolveringsBeskrivelse'),

    harDatabehandlerRepresentantInvolvering: boolCheck('harDatabehandlerRepresentantInvolvering'),

    dataBehandlerRepresentantInvolveringBeskrivelse: stringCheck(
      'dataBehandlerRepresentantInvolveringBeskrivelse'
    ),
  })
}

export const pvkBehovSchema = () => {
  return yup.object({
    pvkVurderingsBegrunnelse: yup.string().test({
      name: 'pvkVurderingsBegrunnelse',
      message: 'Dere må begrunne hvorfor dere ikke skal gjennomføre PVK',
      test: function (pvkVurderingsBegrunnelse) {
        const { parent } = this
        if (parent.skalUtforePvk !== undefined && !parent.skalUtforePvk) {
          if (pvkVurderingsBegrunnelse === '' || pvkVurderingsBegrunnelse === undefined) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    }),
  })
}
export default pvkDocumentSchema

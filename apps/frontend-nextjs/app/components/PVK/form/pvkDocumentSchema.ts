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
    stemmerPersonkategorier: boolCheck(
      'stemmerPersonkategorier',
      'Dere må oppgi om lista over personkategorier stemmer.'
    ),

    personkategoriAntallBeskrivelse: stringCheck(
      'personkategoriAntallBeskrivelse',
      'Dere må beskrive hvor mange personer dere behandler personopplysninger om.'
    ),

    tilgangsBeskrivelsePersonopplysningene: stringCheck(
      'tilgangsBeskrivelsePersonopplysningene',
      'Dere må beskrive hvilke roller som skal ha tilgang til personopplysningene, og pr. rolle, hvor mange som skal ha tilgang til hva.'
    ),

    lagringsBeskrivelsePersonopplysningene: stringCheck(
      'lagringsBeskrivelsePersonopplysningene',
      'Dere må beskrive hvordan og hvor lenge personopplysningene skal lagres.'
    ),

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

export const pvkBehovSchema = () => {
  return yup.object({
    pvkVurderingsBegrunnelse: yup.string().test({
      name: 'pvkVurderingsBegrunnelse',
      message: 'Dere må begrunne hvorfor dere ikke skal gjennomføre PVK',
      test: function (pvkVurderingsBegrunnelse) {
        const { parent } = this
        if (
          parent.skalUtforePvk !== undefined &&
          parent.skalUtforePvk !== null &&
          !parent.skalUtforePvk
        ) {
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

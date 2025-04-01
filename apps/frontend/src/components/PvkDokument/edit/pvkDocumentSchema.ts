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
  yup
    .boolean()
    .test({
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
    .nullable()

export const pvkDocumentSchema = () => {
  return yup.object({
    stemmerPersonkategorier: boolCheck(
      'stemmerPersonkategorier',
      'Du har ikke svart på: Stemmer denne lista over personkategorier?'
    ),

    personkategoriAntallBeskrivelse: stringCheck(
      'personkategoriAntallBeskrivelse',
      'Det må beskrive hvor mange personer dere behandler personopplysninger om.'
    ),

    tilgangsBeskrivelsePersonopplysningene: stringCheck(
      'tilgangsBeskrivelsePersonopplysningene',
      'Du må beskrive hvilke roller som skal ha tilgang til personopplysningene'
    ),

    lagringsBeskrivelsePersonopplysningene: stringCheck(
      'lagringsBeskrivelsePersonopplysningene',
      'Du må beskriv hvordan og hvor lenge personopplysningene skal lagres.'
    ),

    harInvolvertRepresentant: boolCheck(
      'harInvolvertRepresentant',
      'Du har ikke svart på: Har dere involvert en representant for databehandlere?'
    ),

    representantInvolveringsBeskrivelse: stringCheck(
      'representantInvolveringsBeskrivelse',
      'Du har ikke svart på: Beskriv hvordan dere har eller ikke har involvert representant(er) for databehandler(e)'
    ),

    harDatabehandlerRepresentantInvolvering: boolCheck(
      'harDatabehandlerRepresentantInvolvering',
      'Du har ikke svart på: Har dere involvert en representant for de registrerte?'
    ),

    dataBehandlerRepresentantInvolveringBeskrivelse: stringCheck(
      'dataBehandlerRepresentantInvolveringBeskrivelse',
      'Du har ikke svart på: Beskriv hvorfor dere ikke har eller har involvert representant(er) for databehandler(e) '
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

import * as yup from 'yup'
import { EPvkDokumentStatus } from '../../../constants'

export const pvkDocumentSchema = () => {
  return yup.object({
    stemmerPersonkategorier: yup.boolean().test({
      name: 'stemmerPersonkategorier',
      message: 'Dette er et påkrevd felt',
      test: function (stemmerPersonkategorier) {
        const { parent } = this
        if (
          parent.status !== EPvkDokumentStatus.UNDERARBEID &&
          parent.status !== EPvkDokumentStatus.AKTIV
        ) {
          if (stemmerPersonkategorier === undefined || stemmerPersonkategorier === null) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    }),
    personkategoriAntallBeskrivelse: yup.string().test({
      name: 'personkategoriAntallBeskrivelse',
      message: 'Dette er et påkrevd felt',
      test: function (personkategoriAntallBeskrivelse) {
        const { parent } = this
        if (
          parent.status !== EPvkDokumentStatus.UNDERARBEID &&
          parent.status !== EPvkDokumentStatus.AKTIV
        ) {
          if (
            personkategoriAntallBeskrivelse === undefined ||
            personkategoriAntallBeskrivelse === ''
          ) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    }),
    tilgangsBeskrivelsePersonopplysningene: yup.string().test({
      name: 'tilgangsBeskrivelsePersonopplysningene',
      message: 'Dette er et påkrevd felt',
      test: function (tilgangsBeskrivelsePersonopplysningene) {
        const { parent } = this
        console.debug(parent)
        if (
          parent.status !== EPvkDokumentStatus.UNDERARBEID &&
          parent.status !== EPvkDokumentStatus.AKTIV
        ) {
          if (
            tilgangsBeskrivelsePersonopplysningene === undefined ||
            tilgangsBeskrivelsePersonopplysningene === ''
          ) {
            console.debug('test skal feile')
            return false
          } else {
            console.debug('test skal ikke feile')

            return true
          }
        } else {
          console.debug('ingen tester')

          return true
        }
      },
    }),
    lagringsBeskrivelsePersonopplysningene: yup.string().test({
      name: 'lagringsBeskrivelsePersonopplysningene',
      message: 'Dette er et påkrevd felt',
      test: function (lagringsBeskrivelsePersonopplysningene) {
        const { parent } = this
        if (
          parent.status !== EPvkDokumentStatus.UNDERARBEID &&
          parent.status !== EPvkDokumentStatus.AKTIV
        ) {
          if (
            lagringsBeskrivelsePersonopplysningene === undefined ||
            lagringsBeskrivelsePersonopplysningene === ''
          ) {
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

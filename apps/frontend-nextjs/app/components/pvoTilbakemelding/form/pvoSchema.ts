import { EPvoTilbakemeldingStatus } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import * as yup from 'yup'

const boolCheck = (fieldName: string, errorMessage?: string) =>
  yup
    .boolean()
    .test({
      name: fieldName,
      message: errorMessage ? errorMessage : 'Dette er et påkrevd felt',
      test: function (boolField) {
        const { parent } = this
        if (parent.status === EPvoTilbakemeldingStatus.FERDIG) {
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

export const sendInnCheck = () => {
  return yup.object({
    arbeidGarVidere: boolCheck(
      'arbeidGarVidere',
      'Dere må oppgi om det anbefales at arbeidet går videre som planlagt'
    ),
    arbeidGarVidereBegrunnelse: yup.string().test({
      name: 'arbeidGarVidereBegrunnelse',
      message: 'Dere må beskriv anbefalingen nærmere',
      test: function (stringField) {
        const { parent } = this
        if (parent.status === EPvoTilbakemeldingStatus.FERDIG) {
          if (stringField === undefined || stringField === '') {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    }),
    behovForForhandskonsultasjon: boolCheck(
      'behovForForhandskonsultasjon',
      'Dere må oppgi om det er behov for forhåndskonsultasjon med Datatilsynet'
    ),
    behovForForhandskonsultasjonBegrunnelse: yup.string().test({
      name: 'behovForForhandskonsultasjonBegrunnelse',
      message: 'Dere må beskriv anbefalingen nærmere',
      test: function (stringField) {
        const { parent } = this
        if (
          parent.behovForForhandskonsultasjon === true &&
          parent.status === EPvoTilbakemeldingStatus.FERDIG
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
    }),

    pvoVurdering: yup.string().test({
      name: 'pvoVurdering',
      message: 'Dette er et påkrevd felt',
      test: function (stringField) {
        const { parent } = this
        if (parent.status === EPvoTilbakemeldingStatus.FERDIG) {
          if (stringField === null || stringField === undefined || stringField === '') {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      },
    }),
    merknadTilEtterleverEllerRisikoeier: yup.string().test({
      name: 'merknadTilEtterleverEllerRisikoeier',
      message: 'Dette er et påkrevd felt',
      test: function (stringField) {
        const { parent } = this
        if (
          parent.status === EPvoTilbakemeldingStatus.FERDIG &&
          (parent.arbeidGarVidere === false ||
            parent.behovForForhandskonsultasjon === true ||
            (parent.arbeidGarVidere === false && parent.behovForForhandskonsultasjon === true))
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
    }),
  })
}

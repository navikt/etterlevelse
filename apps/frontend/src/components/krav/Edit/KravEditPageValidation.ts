import * as yup from 'yup'
import { EKravStatus, EYupErrorMessage, IKravVersjon, TKravQL } from '../../../constants'

interface IPropsKravSchema {
  newKrav: boolean
  krav: TKravQL | undefined
  alleKravVersjoner: IKravVersjon[]
}

export const kravSchema = ({ newKrav, krav, alleKravVersjoner }: IPropsKravSchema) =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    suksesskriterier: yup.array().test({
      name: 'suksesskriterierCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (suksesskriterier) {
        const { parent } = this
        if (parent.status === EKravStatus.AKTIV) {
          return suksesskriterier &&
            suksesskriterier.length > 0 &&
            suksesskriterier.every((s) => s.navn)
            ? true
            : false
        }
        return true
      },
    }),
    hensikt: yup.string().test({
      name: 'hensiktCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (hensikt) {
        const { parent } = this
        if (parent.status === EKravStatus.AKTIV) {
          return hensikt ? true : false
        }
        return true
      },
    }),
    versjonEndringer: yup.string().test({
      name: 'versjonEndringerCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (versjonEndringer) {
        const { parent } = this
        if (parent.status === EKravStatus.AKTIV) {
          if (!newKrav && krav && krav.kravVersjon > 1) {
            return versjonEndringer ? true : false
          }
        }
        return true
      },
    }),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (regelverk) {
        const { parent } = this
        if (parent.status === EKravStatus.AKTIV) {
          return regelverk && regelverk.length > 0 ? true : false
        }
        return true
      },
    }),
    varslingsadresser: yup.array().test({
      name: 'varslingsadresserCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (varslingsadresser) {
        const { parent } = this
        if (parent.status === EKravStatus.AKTIV) {
          return varslingsadresser && varslingsadresser.length > 0 ? true : false
        }
        return true
      },
    }),
    status: yup.string().test({
      name: 'statusCheck',
      message:
        'Det er ikke lov å sette versjonen til utgått. Det eksistere en aktiv versjon som er lavere enn denne versjonen',
      test: function (status) {
        const { parent } = this
        const nyesteAktivKravVersjon = alleKravVersjoner.filter(
          (k) => k.kravStatus === EKravStatus.AKTIV
        )
        if (
          status === EKravStatus.UTGAATT &&
          nyesteAktivKravVersjon.length >= 1 &&
          parent.kravVersjon > nyesteAktivKravVersjon[0].kravVersjon
        ) {
          return false
        }
        return true
      },
    }),
  })

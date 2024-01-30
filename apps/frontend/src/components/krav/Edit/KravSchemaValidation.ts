import * as yup from 'yup'
import {
  EKravStatus,
  EYupErrorMessage,
  IRegelverk,
  ISuksesskriterie,
  IVarslingsadresse,
} from '../../../constants'

const checkIfAllSuksesskriterieHasName = (suksesskriterier: ISuksesskriterie[]) => {
  return suksesskriterier.length > 0 && suksesskriterier.every((s) => s.navn)
}

const checkIfRegelverkIsEmpty = (regelverk: IRegelverk[]) => {
  return regelverk.length > 0 ? true : false
}

const checkIfVarslingsAddresserIsEmpty = (varslingsadressers: IVarslingsadresse[]) => {
  return varslingsadressers.length > 0 ? true : false
}

const isKravActiveStatus = (status: EKravStatus) => status === EKravStatus.AKTIV

const activeStatusValueValidation = (status: EKravStatus, check: boolean) => {
  if (isKravActiveStatus(status)) {
    return check
  }
  return true
}

export const kravCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et tittel til suksesskriterie'),
    suksesskriterier: yup.array().test({
      name: 'suksesskriterierCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (suksesskriterier) {
        const { parent } = this
        activeStatusValueValidation(
          parent.status,
          checkIfAllSuksesskriterieHasName(suksesskriterier as ISuksesskriterie[])
        )
      },
    }),
    hensikt: yup.string().test({
      name: 'hensiktCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (hensikt) {
        const { parent } = this
        activeStatusValueValidation(parent.status, hensikt ? true : false)
      },
    }),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (regelverk) {
        const { parent } = this
        activeStatusValueValidation(
          parent.status,
          checkIfRegelverkIsEmpty(regelverk as IRegelverk[])
        )
      },
    }),
    varslingsadresser: yup.array().test({
      name: 'varslingsadresserCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (varslingsadresser) {
        const { parent } = this
        activeStatusValueValidation(
          parent.status,
          checkIfVarslingsAddresserIsEmpty(varslingsadresser as IVarslingsadresse[])
        )
      },
    }),
  })

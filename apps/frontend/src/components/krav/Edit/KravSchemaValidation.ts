import * as yup from 'yup'
import {
  EKravStatus,
  EYupErrorMessage,
  IRegelverk,
  ISuksesskriterie,
  IVarslingsadresse,
} from '../../../constants'

const checkIfHensiktHasValue = (hensikt: string): boolean => {
  return hensikt ? true : false
}

const checkIfAllSuksesskriterieHasName = (suksesskriterier: ISuksesskriterie[]): boolean => {
  return suksesskriterier.length > 0 && suksesskriterier.every((s) => s.navn)
}

const checkIfRegelverkIsEmpty = (regelverk: IRegelverk[]): boolean => {
  const regelverkCheck = regelverk.length > 0 ? true : false

  return regelverkCheck
}

const checkIfVarslingsAddresserIsEmpty = (varslingsadressers: IVarslingsadresse[]): boolean => {
  return varslingsadressers.length > 0 ? true : false
}

const isKravActiveStatus = (status: EKravStatus): boolean => status === EKravStatus.AKTIV

const activeStatusValueValidation = (status: EKravStatus, check: boolean): boolean => {
  if (isKravActiveStatus(status)) {
    return check
  }
  return true
}

export const kravCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    hensikt: yup.string().test({
      name: 'hensiktCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (hensikt) {
        const { parent } = this
        return activeStatusValueValidation(parent.status, checkIfHensiktHasValue(hensikt as string))
      },
    }),
    suksesskriterier: yup.array().test({
      name: 'suksesskriterierCheck',
      message: 'Alle sukesskriterie må ha en tittel',
      test: function (suksesskriterier) {
        const { parent } = this
        return activeStatusValueValidation(
          parent.status,
          !!checkIfAllSuksesskriterieHasName(suksesskriterier as ISuksesskriterie[])
        )
      },
    }),
    regelverk: yup.array().test({
      name: 'regelverkCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (regelverk) {
        const { parent } = this
        return activeStatusValueValidation(
          parent.status,
          !!checkIfRegelverkIsEmpty(regelverk as IRegelverk[])
        )
      },
    }),
    varslingsadresser: yup.array().test({
      name: 'varslingsadresserCheck',
      message: EYupErrorMessage.PAAKREVD,
      test: function (varslingsadresser) {
        const { parent } = this
        return activeStatusValueValidation(
          parent.status,
          !!checkIfVarslingsAddresserIsEmpty(varslingsadresser as IVarslingsadresse[])
        )
      },
    }),
  })

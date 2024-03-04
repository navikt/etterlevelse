import * as yup from 'yup'
import {
  EKravStatus,
  EYupErrorMessage,
  IKravVersjon,
  IRegelverk,
  ISuksesskriterie,
  IVarslingsadresse,
} from '../../../constants'

interface IPropsKravSchema {
  alleKravVersjoner: IKravVersjon[]
}

const checkIfHensiktHasValue = (hensikt: string): boolean => {
  return hensikt ? true : false
}

const checkIfAllSuksesskriterieHasName = (suksesskriterier: ISuksesskriterie[]): boolean => {
  return suksesskriterier.length > 0 && suksesskriterier.every((suksesskriterium) => suksesskriterium.navn)
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

const checkIfVersjonEndringIsEmpty = (versjonEndringer: string, kravVersjon: number) => {
  if (kravVersjon > 1) {
    return versjonEndringer ? true : false
  }
  return true
}

const hensiktCheck = yup.string().test({
  name: 'hensiktCheck',
  message: EYupErrorMessage.PAAKREVD,
  test: function (hensikt) {
    const { parent } = this
    return activeStatusValueValidation(parent.status, checkIfHensiktHasValue(hensikt as string))
  },
})

const suksesskriterierCheck = yup.array().test({
  name: 'suksesskriterierCheck',
  message: 'Alle sukesskriterie må ha en tittel',
  test: function (suksesskriterier) {
    const { parent } = this
    return activeStatusValueValidation(
      parent.status,
      !!checkIfAllSuksesskriterieHasName(suksesskriterier as ISuksesskriterie[])
    )
  },
})

const regelverkCheck = yup.array().test({
  name: 'regelverkCheck',
  message: EYupErrorMessage.PAAKREVD,
  test: function (regelverk) {
    const { parent } = this
    return activeStatusValueValidation(
      parent.status,
      !!checkIfRegelverkIsEmpty(regelverk as IRegelverk[])
    )
  },
})

const varslingsadresserCheck = yup.array().test({
  name: 'varslingsadresserCheck',
  message: 'Påkrevd minst en varslingsadresse',
  test: function (varslingsadresser) {
    const { parent } = this
    return activeStatusValueValidation(
      parent.status,
      !!checkIfVarslingsAddresserIsEmpty(varslingsadresser as IVarslingsadresse[])
    )
  },
})

const versjonEndringCheck = yup.string().test({
  name: 'versjonEndringerCheck',
  message: EYupErrorMessage.PAAKREVD,
  test: function (versjonEndringer) {
    const { parent } = this
    return activeStatusValueValidation(
      parent.status,
      checkIfVersjonEndringIsEmpty(versjonEndringer as string, parent.kravVersjon)
    )
  },
})

export const kravCreateValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    hensikt: hensiktCheck,
    suksesskriterier: suksesskriterierCheck,
    regelverk: regelverkCheck,
    varslingsadresser: varslingsadresserCheck,
  })

export const kravNewVersionValidation = () =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    hensikt: hensiktCheck,
    suksesskriterier: suksesskriterierCheck,
    regelverk: regelverkCheck,
    varslingsadresser: varslingsadresserCheck,
    versjonEndringer: versjonEndringCheck,
  })

export const kravEditValidation = ({ alleKravVersjoner }: IPropsKravSchema) =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    hensikt: hensiktCheck,
    suksesskriterier: suksesskriterierCheck,
    regelverk: regelverkCheck,
    varslingsadresser: varslingsadresserCheck,
    versjonEndringer: versjonEndringCheck,

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

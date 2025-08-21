import { IRegelverk } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, IKravVersjon, ISuksesskriterie } from '@/constants/krav/kravConstants'
import { IVarslingsadresse } from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import * as yup from 'yup'

const isKravActiveStatus = (status: EKravStatus): boolean => status === EKravStatus.AKTIV

const activeStatusValueValidation = (status: EKravStatus, check: boolean): boolean => {
  if (isKravActiveStatus(status)) {
    return check
  }
  return true
}

const checkIfHensiktHasValue = (hensikt: string): boolean => {
  return hensikt ? true : false
}

const hensiktCheck = yup.string().test({
  name: 'hensiktCheck',
  message: 'Du må oppgi et hensikt til kravet',
  test: function (hensikt) {
    const { parent } = this
    return activeStatusValueValidation(parent.status, checkIfHensiktHasValue(hensikt as string))
  },
})

const checkIfAllSuksesskriterieHasName = (suksesskriterier: ISuksesskriterie[]): boolean => {
  return (
    suksesskriterier.length > 0 &&
    suksesskriterier.every((suksesskriterium) => suksesskriterium.navn)
  )
}

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

const checkIfRegelverkIsEmpty = (regelverk: IRegelverk[]): boolean => {
  const regelverkCheck = regelverk.length > 0 ? true : false

  return regelverkCheck
}

const regelverkCheck = yup.array().test({
  name: 'regelverkCheck',
  message: 'Kravet må være knyttet til et regelverk',
  test: function (regelverk) {
    const { parent } = this
    return activeStatusValueValidation(
      parent.status,
      !!checkIfRegelverkIsEmpty(regelverk as IRegelverk[])
    )
  },
})

const checkIfVarslingsAddresserIsEmpty = (varslingsadressers: IVarslingsadresse[]): boolean => {
  return varslingsadressers.length > 0 ? true : false
}

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

enum EYupErrorMessage {
  PAAKREVD = 'Feltet er påkrevd',
}

const checkIfVersjonEndringIsEmpty = (versjonEndringer: string, kravVersjon: number) => {
  if (kravVersjon > 1) {
    return versjonEndringer ? true : false
  }
  return true
}

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

interface IPropsKravSchema {
  alleKravVersjoner: IKravVersjon[]
  isEditingUtgaattKrav: boolean
}

export const kravEditValidation = ({ alleKravVersjoner, isEditingUtgaattKrav }: IPropsKravSchema) =>
  yup.object({
    navn: yup.string().required('Du må oppgi et navn til kravet'),
    hensikt: hensiktCheck,
    suksesskriterier: suksesskriterierCheck,
    regelverk: regelverkCheck,
    varslingsadresserQl: varslingsadresserCheck,
    versjonEndringer: versjonEndringCheck,

    beskrivelse: yup.string().test({
      name: 'beskrivelseCheck',
      message: 'Begrunn hvorfor kravet er utgått',
      test: function (beskrivelse) {
        const { parent } = this

        if (parent.status === EKravStatus.UTGAATT && !isEditingUtgaattKrav) {
          return beskrivelse ? true : false
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
          (krav: IKravVersjon) => krav.kravStatus === EKravStatus.AKTIV
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

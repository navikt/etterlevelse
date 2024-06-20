import * as yup from 'yup'

const titleCheck = yup.string().required('Etterlevelsesdokumentasjon trenger en tittel')

const varslingsadresserCheck = yup.array().test({
  name: 'varslingsadresserCheck',
  message: 'Påkrevd minst en varslingsadresse',
  test: function (varslingsadresser) {
    return varslingsadresser && varslingsadresser.length > 0 ? true : false
  },
})

const virkemiddelIdCheck = yup.string().test({
  name: 'addedVirkemiddelCheck',
  message: 'Hvis ditt system/produkt er tilknyttet et virkemiddel må det legges til.',
  test: function (virkemiddelId) {
    const { parent } = this
    if (parent.knyttetTilVirkemiddel === true) {
      return virkemiddelId ? true : false
    }
    return true
  },
})

export const etterlevelseDokumentasjonSchema = () =>
  yup.object({
    title: titleCheck,
    varslingsadresser: varslingsadresserCheck,
    virkemiddelId: virkemiddelIdCheck,
  })

export const etterlevelseDokumentasjonWithRelationSchema = () =>
  yup.object({
    title: titleCheck,
    varslingsadresser: varslingsadresserCheck,
    virkemiddelId: virkemiddelIdCheck,
    relationType: yup.string().required('Trenger å angi relasjons type'),
  })

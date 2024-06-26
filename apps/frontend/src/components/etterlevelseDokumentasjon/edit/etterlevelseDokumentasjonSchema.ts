import * as yup from 'yup'

const titleCheck = yup.string().required('Etterlevelsesdokumentasjon trenger en tittel')

const varslingsadresserCheck = yup.array().test({
  name: 'varslingsadresserCheck',
  message: 'Påkrevd minst en varslingsadresse',
  test: function (varslingsadresser) {
    return varslingsadresser && varslingsadresser.length > 0 ? true : false
  },
})

const teamsDataCheck = yup.array().test({
  name: 'teamsDataCheck',
  message: 'Påkrevd minst et team eller en person',
  test: function (teamsData) {
    const { parent } = this
    console.debug(parent.resourcesData)
    return (teamsData && teamsData.length > 0) ||
      (parent.resourcesData && parent.resourcesData.length > 0)
      ? true
      : false
  },
})

const resourcesDataCheck = yup.array().test({
  name: 'resourcesDataCheck',
  message: 'Påkrevd minst et team eller en person',
  test: function (resourcesData) {
    const { parent } = this
    return (resourcesData && resourcesData.length > 0) ||
      (parent.teamsData && parent.teamsData.length > 0)
      ? true
      : false
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
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
  })

export const etterlevelseDokumentasjonWithRelationSchema = () =>
  yup.object({
    title: titleCheck,
    varslingsadresser: varslingsadresserCheck,
    virkemiddelId: virkemiddelIdCheck,
    relationType: yup.string().required('Trenger å angi relasjons type'),
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
  })

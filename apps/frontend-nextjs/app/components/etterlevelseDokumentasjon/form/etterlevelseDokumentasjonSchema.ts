import * as yup from 'yup'

const titleCheck = yup.string().required('Etterlevelsesdokumentasjon trenger en tittel')
const beskrivelseCheck = yup.string().required('Etterlevelsesdokumentasjon trenger en beskrivelse')

const varslingsadresserCheck = yup.array().test({
  name: 'varslingsadresserCheck',
  message: 'Påkrevd minst 1 varslingsadresse',
  test: function (varslingsadresser) {
    return varslingsadresser && varslingsadresser.length > 0 ? true : false
  },
})

const teamsDataCheck = yup.array().test({
  name: 'teamsDataCheck',
  message: 'Påkrevd minst 1 team eller 1 person',
  test: function (teamsData) {
    const { parent } = this
    return (teamsData && teamsData.length > 0) ||
      (parent.resourcesData && parent.resourcesData.length > 0)
      ? true
      : false
  },
})

const resourcesDataCheck = yup.array().test({
  name: 'resourcesDataCheck',
  message: 'Påkrevd minst 1 team eller 1 person',
  test: function (resourcesData) {
    const { parent } = this
    return (resourcesData && resourcesData.length > 0) ||
      (parent.teamsData && parent.teamsData.length > 0)
      ? true
      : false
  },
})

export const etterlevelseDokumentasjonSchema = () =>
  yup.object({
    title: titleCheck,
    beskrivelse: beskrivelseCheck,
    varslingsadresser: varslingsadresserCheck,
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
  })

import * as yup from 'yup'

export enum EPaKrevdMember {
  PAKREVD = 'Påkrevd minst 1 team eller 1 person',
}

export enum EEtterlevelseDokumentSchemaMelding {
  TITLE = 'Etterlevelsesdokumentasjon trenger en tittel',
  BESKRIVELSE = 'Etterlevelsesdokumentasjon trenger en beskrivelse',
  VARSLINGSADRESSER = 'Påkrevd minst 1 varslingsadresse',
  TEAMDATA = EPaKrevdMember.PAKREVD,
  RESOURCEDATA = EPaKrevdMember.PAKREVD,
  NOM_AVDELING_ID = 'Dere må angi hvilken avdeling som er ansvarlig for etterlevelsen',
}

export const titleCheck = yup.string().required(EEtterlevelseDokumentSchemaMelding.TITLE)
export const beskrivelseCheck = yup
  .string()
  .required(EEtterlevelseDokumentSchemaMelding.BESKRIVELSE)

export const varslingsadresserCheck = yup.array().test({
  name: 'varslingsadresserCheck',
  message: EEtterlevelseDokumentSchemaMelding.VARSLINGSADRESSER,
  test: function (varslingsadresser) {
    return varslingsadresser && varslingsadresser.length > 0 ? true : false
  },
})

export const teamsDataCheck = yup.array().test({
  name: 'teamsDataCheck',
  message: EEtterlevelseDokumentSchemaMelding.TEAMDATA,
  test: function (teamsData) {
    const { parent } = this
    return (teamsData && teamsData.length > 0) ||
      (parent.resourcesData && parent.resourcesData.length > 0)
      ? true
      : false
  },
})

export const resourcesDataCheck = yup.array().test({
  name: 'resourcesDataCheck',
  message: EEtterlevelseDokumentSchemaMelding.RESOURCEDATA,
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
    nomAvdelingId: yup.string().required(EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID),
  })

export const etterlevelseDokumentasjonWithRelationSchema = () =>
  yup.object({
    title: titleCheck,
    varslingsadresser: varslingsadresserCheck,
    relationType: yup
      .string()
      .required('Du må velge hvordan du ønsker å gjenbruke dette dokumentet'),
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
    nomAvdelingId: yup.string().required(EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID),
  })

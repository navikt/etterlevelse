import * as yup from 'yup'
import {
  INomEnhet,
  tjenestelinjeId,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

export enum EPaKrevdMember {
  PAKREVD = 'Påkrevd minst 1 team eller 1 person',
}

export enum EEtterlevelseDokumentSchemaMelding {
  TITLE = 'Etterlevelsesdokumentasjon trenger en tittel',
  BESKRIVELSE = 'Etterlevelsesdokumentasjon trenger en beskrivelse',
  VARSLINGSADRESSER = 'Påkrevd minst 1 varslingsadresse',
  TEAMDATA = 'Påkrevd minst 1 team',
  RESOURCEDATA = 'Påkrevd minst 1 person',
  NOM_AVDELING_ID = 'Dere må angi hvilken avdeling som er ansvarlig for etterlevelsen',
  NOM_FOR_ETTERLEVELSE_I_LINJE = 'Dere må angi om ansvaret er under seksjon eller linje',
  NOM_SEKSJON = 'Dere må velge minst en seksjon i direktoratet',
  NOM_LINJE = 'Dere må velge minst en linje',
  NOM_FYLKE = 'Dere må velge minst en fylke',
  NOM_LINJEENHET = 'Dere må velge minst en linjeenhet',
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

export const nomOrganiseringCheck = yup.object({
  nomAvdelingId: yup.string().required(EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID),
  forEtterlevelseILinje: yup
    .boolean()
    .strict()
    .typeError(EEtterlevelseDokumentSchemaMelding.NOM_FOR_ETTERLEVELSE_I_LINJE)
    .required(EEtterlevelseDokumentSchemaMelding.NOM_FOR_ETTERLEVELSE_I_LINJE),
  seksjoner: yup.array().when('forEtterlevelseILinje', {
    is: false,
    then: (schema) =>
      schema
        .required(EEtterlevelseDokumentSchemaMelding.NOM_SEKSJON)
        .min(1, EEtterlevelseDokumentSchemaMelding.NOM_SEKSJON),
  }),
  linjer: yup.array().when('forEtterlevelseILinje', {
    is: true,
    then: (schema) =>
      schema
        .required(EEtterlevelseDokumentSchemaMelding.NOM_LINJE)
        .min(1, EEtterlevelseDokumentSchemaMelding.NOM_LINJE),
  }),
  linjeEnheter: yup.array().when(['forEtterlevelseILinje', 'linjer'], {
    is: (forEtterlevelseILinje: boolean, linjer: INomEnhet[] | undefined) =>
      forEtterlevelseILinje === true &&
      linjer?.some((linje) => linje.nomEnhetId !== tjenestelinjeId),
    then: (schema) =>
      schema
        .required(EEtterlevelseDokumentSchemaMelding.NOM_LINJEENHET)
        .min(1, EEtterlevelseDokumentSchemaMelding.NOM_LINJEENHET),
  }),
  linjeFylker: yup.array().when(['forEtterlevelseILinje', 'linjer'], {
    is: (forEtterlevelseILinje: boolean, linjer: INomEnhet[] | undefined) =>
      forEtterlevelseILinje === true &&
      linjer?.some((linje) => linje.nomEnhetId === tjenestelinjeId),
    then: (schema) =>
      schema
        .required(EEtterlevelseDokumentSchemaMelding.NOM_FYLKE)
        .min(1, EEtterlevelseDokumentSchemaMelding.NOM_FYLKE),
  }),
})

export const etterlevelseDokumentasjonSchema = () =>
  yup.object({
    title: titleCheck,
    beskrivelse: beskrivelseCheck,
    varslingsadresser: varslingsadresserCheck,
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
    nomOrganisering: nomOrganiseringCheck,
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
    nomOrganisering: nomOrganiseringCheck,
  })

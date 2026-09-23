import * as yup from 'yup'
import {
  EEtterlevelseDokumentSchemaMelding,
  beskrivelseCheck,
  resourcesDataCheck,
  teamsDataCheck,
  titleCheck,
  varslingsadresserCheck,
} from '@/components/etterlevelseDokumentasjon/form/etterlevelseDokumentasjonSchema'

const gjenbrukBeskrivelseCheck = yup.string().required('Påkrevd')

export const gjenbrukDokumentasjonSchema = () =>
  yup.object({
    title: titleCheck,
    beskrivelse: beskrivelseCheck,
    varslingsadresser: varslingsadresserCheck,
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
    nomAvdelingId: yup.string().required(EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID),
    gjenbrukBeskrivelse: gjenbrukBeskrivelseCheck,
  })

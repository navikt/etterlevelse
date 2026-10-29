import * as yup from 'yup'
import {
  beskrivelseCheck,
  nomOrganiseringCheck,
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
    nomOrganisering: nomOrganiseringCheck,
    gjenbrukBeskrivelse: gjenbrukBeskrivelseCheck,
  })

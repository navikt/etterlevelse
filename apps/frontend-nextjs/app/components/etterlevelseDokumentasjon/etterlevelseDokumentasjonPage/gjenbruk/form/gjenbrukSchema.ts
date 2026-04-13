import {
  beskrivelseCheck,
  resourcesDataCheck,
  teamsDataCheck,
  titleCheck,
  varslingsadresserCheck,
} from '@/components/etterlevelseDokumentasjon/form/etterlevelseDokumentasjonSchema'
import * as yup from 'yup'

const gjenbrukBeskrivelseCheck = yup.string().required('Påkrevd')

export const gjenbrukDokumentasjonSchema = () =>
  yup.object({
    title: titleCheck,
    beskrivelse: beskrivelseCheck,
    varslingsadresser: varslingsadresserCheck,
    teamsData: teamsDataCheck,
    resourcesData: resourcesDataCheck,
    nomAvdelingId: yup
      .string()
      .required('Dere må angi hvilken avdeling som er ansvarlig for etterlevelsen'),
    gjenbrukBeskrivelse: gjenbrukBeskrivelseCheck,
  })

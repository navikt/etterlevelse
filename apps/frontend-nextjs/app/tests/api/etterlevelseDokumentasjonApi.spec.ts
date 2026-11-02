import { expect, test } from '@playwright/test'
import axios from 'axios'
import {
  etterlevelseDokumentasjonMapToFormVal,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { gjenbrukDokumentasjonSchema } from '@/components/etterlevelseDokumentasjon/etterlevelseDokumentasjonPage/gjenbruk/form/gjenbrukSchema'
import {
  EEtterlevelseDokumentSchemaMelding,
  etterlevelseDokumentasjonSchema,
  etterlevelseDokumentasjonWithRelationSchema,
} from '@/components/etterlevelseDokumentasjon/form/etterlevelseDokumentasjonSchema'
import { INomOrganisering } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

const nomOrganisering: INomOrganisering = {
  nomAvdelingId: 'avdeling-1',
  avdelingNavn: 'Avdeling',
  seksjoner: [{ nomSeksjonId: 'seksjon-1', nomSeksjonName: 'Seksjon' }],
  enheter: [{ nomEnhetId: 'enhet-1', nomEnhetName: 'Enhet' }],
  linjer: [{ nomEnhetId: 'linje-1', nomEnhetName: 'Linje' }],
  linjeEnheter: [{ nomEnhetId: 'linje-enhet-1', nomEnhetName: 'Linjeenhet' }],
  linjeFylker: [{ nomEnhetId: 'fylke-1', nomEnhetName: 'Fylke' }],
  fylkeKontorer: [{ nomEnhetId: 'kontor-1', nomEnhetName: 'Kontor' }],
}

test('initializes nested organization fields without flattened duplicates', () => {
  const values = etterlevelseDokumentasjonMapToFormVal({})

  expect(values.nomOrganisering).toEqual({
    nomAvdelingId: '',
    avdelingNavn: '',
    seksjoner: [],
    enheter: [],
    linjer: [],
    linjeEnheter: [],
    linjeFylker: [],
    fylkeKontorer: [],
  })
  for (const field of ['nomAvdelingId', 'avdelingNavn', 'seksjoner', 'enheter']) {
    expect(values).not.toHaveProperty(field)
  }
})

test('preserves nested organization data when mapping and saving edits', async () => {
  const values = etterlevelseDokumentasjonMapToFormVal({ id: 'dokument-1', nomOrganisering })
  expect(values.nomOrganisering).toEqual(nomOrganisering)
  expect(values.nomOrganisering).not.toBe(nomOrganisering)

  const editedValues = {
    ...values,
    nomOrganisering: { ...nomOrganisering, avdelingNavn: 'Endret avdeling' },
  }
  const adapter = axios.defaults.adapter
  let requestCount = 0
  axios.defaults.adapter = async (config) => {
    requestCount += 1
    const body = JSON.parse(config.data)
    expect(body.nomOrganisering).toEqual(editedValues.nomOrganisering)
    for (const field of ['nomAvdelingId', 'avdelingNavn', 'seksjoner', 'enheter']) {
      expect(body).not.toHaveProperty(field)
    }
    return { data: editedValues, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await expect(updateEtterlevelseDokumentasjon(editedValues)).resolves.toEqual(editedValues)
    expect(requestCount).toBe(1)
  } finally {
    axios.defaults.adapter = adapter
  }
})

for (const [name, schema] of [
  ['document', etterlevelseDokumentasjonSchema()],
  ['related document', etterlevelseDokumentasjonWithRelationSchema()],
  ['reuse', gjenbrukDokumentasjonSchema()],
] as const) {
  test(`${name} validates the nested department field`, async () => {
    const values = etterlevelseDokumentasjonMapToFormVal({})
    await expect(schema.validateAt('nomOrganisering.nomAvdelingId', values)).rejects.toThrow(
      EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID
    )
    await expect(
      schema.validateAt('nomOrganisering.nomAvdelingId', { ...values, nomOrganisering })
    ).resolves.toBe('avdeling-1')
  })
}

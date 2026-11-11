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
import {
  INomOrganisering,
  tjenestelinjeId,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

const nomOrganisering: INomOrganisering = {
  nomAvdelingId: 'avdeling-1',
  avdelingNavn: 'Avdeling',
  seksjoner: [{ nomSeksjonId: 'seksjon-1', nomSeksjonName: 'Seksjon' }],
  enheter: [{ nomEnhetId: 'enhet-1', nomEnhetName: 'Enhet' }],
  forEtterlevelseILinje: false,
  linjer: [{ nomEnhetId: 'linje-1', nomEnhetName: 'Linje' }],
  linjeEnheter: [{ nomEnhetId: 'linje-enhet-1', nomEnhetName: 'Linjeenhet' }],
  lokalEnheter: [{ nomEnhetId: 'lokal-enhet-1', nomEnhetName: 'Lokalenhet' }],
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
    forEtterlevelseILinje: false,
    linjer: [],
    linjeEnheter: [],
    lokalEnheter: [],
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
  test(`${name} requires an explicit boolean for line compliance`, async () => {
    const withLineCompliance = (forEtterlevelseILinje: unknown) => ({
      nomOrganisering: { ...nomOrganisering, forEtterlevelseILinje },
    })

    for (const value of [true, false]) {
      await expect(
        schema.validateAt('nomOrganisering.forEtterlevelseILinje', withLineCompliance(value))
      ).resolves.toBe(value)
      await expect(
        schema.validateAt('nomOrganisering', withLineCompliance(value))
      ).resolves.toEqual(withLineCompliance(value).nomOrganisering)
    }

    for (const value of [undefined, null, '', 'true', 'false', 0, 1, [], {}]) {
      await expect(
        schema.validateAt('nomOrganisering.forEtterlevelseILinje', withLineCompliance(value))
      ).rejects.toThrow(EEtterlevelseDokumentSchemaMelding.NOM_FOR_ETTERLEVELSE_I_LINJE)
      await expect(schema.validateAt('nomOrganisering', withLineCompliance(value))).rejects.toThrow(
        EEtterlevelseDokumentSchemaMelding.NOM_FOR_ETTERLEVELSE_I_LINJE
      )
    }
  })

  test(`${name} validates the nested department field`, async () => {
    const values = etterlevelseDokumentasjonMapToFormVal({})
    await expect(schema.validateAt('nomOrganisering.nomAvdelingId', values)).rejects.toThrow(
      EEtterlevelseDokumentSchemaMelding.NOM_AVDELING_ID
    )
    await expect(
      schema.validateAt('nomOrganisering.nomAvdelingId', { ...values, nomOrganisering })
    ).resolves.toBe('avdeling-1')
  })

  test(`${name} requires counties only when the service line is selected for line compliance`, async () => {
    const tjenestelinje = {
      nomEnhetId: tjenestelinjeId,
      nomEnhetName: 'Arbeids- og tjenestelinjen',
    }

    for (const linjer of [[tjenestelinje], [...nomOrganisering.linjer, tjenestelinje]]) {
      for (const linjeFylker of [[], undefined, null]) {
        await expect(
          schema.validateAt('nomOrganisering.linjeFylker', {
            nomOrganisering: {
              ...nomOrganisering,
              forEtterlevelseILinje: true,
              linjer,
              linjeFylker,
            },
          })
        ).rejects.toThrow(EEtterlevelseDokumentSchemaMelding.NOM_FYLKE)
      }

      await expect(
        schema.validateAt('nomOrganisering.linjeFylker', {
          nomOrganisering: { ...nomOrganisering, forEtterlevelseILinje: true, linjer },
        })
      ).resolves.toEqual(nomOrganisering.linjeFylker)
    }

    for (const [forEtterlevelseILinje, linjer] of [
      [true, nomOrganisering.linjer],
      [true, []],
      [true, undefined],
      [false, [tjenestelinje]],
    ] as const) {
      for (const linjeFylker of [[], undefined]) {
        await expect(
          schema.validateAt('nomOrganisering.linjeFylker', {
            nomOrganisering: {
              ...nomOrganisering,
              forEtterlevelseILinje,
              linjer,
              linjeFylker,
            },
          })
        ).resolves.toEqual(linjeFylker)
      }
    }
  })

  test(`${name} requires line units only when a non-service line is selected for line compliance`, async () => {
    const tjenestelinje = {
      nomEnhetId: tjenestelinjeId,
      nomEnhetName: 'Arbeids- og tjenestelinjen',
    }

    for (const linjer of [nomOrganisering.linjer, [...nomOrganisering.linjer, tjenestelinje]]) {
      for (const linjeEnheter of [[], undefined, null]) {
        await expect(
          schema.validateAt('nomOrganisering.linjeEnheter', {
            nomOrganisering: {
              ...nomOrganisering,
              forEtterlevelseILinje: true,
              linjer,
              linjeEnheter,
            },
          })
        ).rejects.toThrow(EEtterlevelseDokumentSchemaMelding.NOM_LINJEENHET)
      }

      await expect(
        schema.validateAt('nomOrganisering.linjeEnheter', {
          nomOrganisering: { ...nomOrganisering, forEtterlevelseILinje: true, linjer },
        })
      ).resolves.toEqual(nomOrganisering.linjeEnheter)
    }

    for (const [forEtterlevelseILinje, linjer] of [
      [true, [tjenestelinje]],
      [true, []],
      [true, undefined],
      [false, nomOrganisering.linjer],
    ] as const) {
      for (const linjeEnheter of [[], undefined]) {
        await expect(
          schema.validateAt('nomOrganisering.linjeEnheter', {
            nomOrganisering: {
              ...nomOrganisering,
              forEtterlevelseILinje,
              linjer,
              linjeEnheter,
            },
          })
        ).resolves.toEqual(linjeEnheter)
      }
    }
  })

  for (const [forEtterlevelseILinje, requiredField, otherField, message] of [
    [false, 'seksjoner', 'linjer', EEtterlevelseDokumentSchemaMelding.NOM_SEKSJON],
    [true, 'linjer', 'seksjoner', EEtterlevelseDokumentSchemaMelding.NOM_LINJE],
  ] as const) {
    test(`${name} requires ${requiredField} for the selected responsibility`, async () => {
      for (const nomAvdelingId of ['avdeling-1', '']) {
        for (const value of [[], undefined, null]) {
          const values = {
            nomOrganisering: {
              ...nomOrganisering,
              nomAvdelingId,
              forEtterlevelseILinje,
              [requiredField]: value,
            },
          }
          await expect(
            schema.validateAt(`nomOrganisering.${requiredField}`, values)
          ).rejects.toThrow(message)
        }
      }

      const values = {
        nomOrganisering: {
          ...nomOrganisering,
          forEtterlevelseILinje,
          [otherField]: [],
        },
      }
      await expect(schema.validateAt('nomOrganisering', values)).resolves.toEqual(
        values.nomOrganisering
      )
    })
  }
}

import { test } from '@playwright/test'
import { EKrav } from '../src/constants'
import { EGroup } from '../src/services/User'

const mockUserinfo = {
  loggedIn: true,
  ident: 'G000000',
  name: 'Donald Duck',
  email: 'donald.duck@nav.no',
  groups: [EGroup.ADMIN, EGroup.WRITE, EGroup.READ],
}

const mockKrav = {
  kravTittel: 'Krav tittel',
  kravSuksesskriteriumNavn: 'Suksesskriterium navn',
}

const mockKrav2 = {
  data: {
    kravById: {
      id: '6d52e400-69af-4f50-9d2c-cc3302d8211c',
      kravNummer: 248,
      kravVersjon: 1,
      changeStamp: {
        lastModifiedBy: 'G155120 - Groseth, Lord Andre',
        lastModifiedDate: '2024-02-14T11:20:08.190948',
        __typename: 'ChangeStamp',
      },
      navn: 'Test',
      beskrivelse: null,
      hensikt: 'test 2',
      notat: 'testing',
      varselMelding: 'testing',
      utdypendeBeskrivelse: null,
      versjonEndringer: null,
      aktivertDato: '2024-02-14T11:18:27.85032516',
      dokumentasjon: [],
      implementasjoner: null,
      begrepIder: [],
      begreper: [],
      virkemidler: [],
      virkemiddelIder: [],
      varslingsadresser: [
        {
          adresse: 'Rebecca.Soraya.Gjerstad@nav.no',
          type: 'EPOST',
          slackChannel: null,
          slackUser: null,
          __typename: 'Varslingsadresse',
        },
      ],
      rettskilder: [],
      regelverk: [
        {
          lov: {
            code: 'FORSKRIFT_EFORVALTNING',
            shortName: 'eForvaltningsforskriften',
            __typename: 'Code',
          },
          spesifisering: 'f',
          __typename: 'Regelverk',
        },
      ],
      tagger: [],
      avdeling: null,
      underavdeling: {
        code: 'INFORMASJON',
        shortName: 'Seksjon for informasjonsforvaltning (YTA)',
        __typename: 'Code',
      },
      relevansFor: [],
      status: 'AKTIV',
      suksesskriterier: [
        {
          id: 0,
          navn: 'errf',
          beskrivelse: 'still testing',
          behovForBegrunnelse: false,
          __typename: 'Suksesskriterie',
        },
      ],
      kravIdRelasjoner: [],
      kravRelasjoner: [],
      etterlevelser: [],
      __typename: 'Krav',
    },
  },
}

test.describe('KravEditPage', () => {
  test('Rediger krav', async ({ page }) => {
    await page.route('https://etterlevelse.intern.dev.nav.no/', async (route) => {
      const json = [mockUserinfo]
      await route.fulfill({ json })
    })

    await page.goto('https://etterlevelse.intern.dev.nav.no/')
    await page.getByText('Logg inn').click()
    await page.getByPlaceholder('someone@example.com').fill(mockUserinfo.email)
    await page.getByText('Next').click()

    await page.goto('https://etterlevelse.intern.dev.nav.no/')
    await page.getByText(mockUserinfo.ident).click()
    await page.getByText(EKrav.KRAV).click()

    await page.goto('https://etterlevelse.intern.dev.nav.no/kravliste')

    await page.goto(
      'https://etterlevelse.intern.dev.nav.no/krav/redigering/6d52e400-69af-4f50-9d2c-cc3302d8211c'
    )
    await page.goto('https://etterlevelse.intern.dev.nav.no/krav/redigering/249/1/')
    await page.getByPlaceholder('Krav tittel').fill(mockKrav2.data.kravById.navn)
    mockKrav2.data.kravById.suksesskriterier.map(async (suksesskriterie) => {
      await page.getByPlaceholder('Navn').fill(suksesskriterie.navn)
    })
  })
})

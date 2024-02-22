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
  data: {
    kravById: {
      id: 'af1ab035-e921-47bb-a398-0fc006c5c030',
      kravNummer: 249,
      kravVersjon: 1,
      changeStamp: {
        lastModifiedBy: 'G166656 - Gjerstad, Rebecca Soraya',
        lastModifiedDate: '2024-02-22T10:22:53.232759',
        __typename: 'ChangeStamp',
      },
      navn: 'Test',
      beskrivelse: null,
      hensikt: 'Hensikt',
      notat: 'Notater',
      varselMelding: 'Forklaring til etterlevere',
      utdypendeBeskrivelse: null,
      versjonEndringer: null,
      aktivertDato: '2024-02-22T10:22:52.948286135',
      dokumentasjon: ['[Navn på kilde](http://localhost:3000/kravliste/opprett)'],
      implementasjoner: null,
      begrepIder: ['BEGREP-2435'],
      begreper: [
        {
          id: 'BEGREP-2435',
          navn: 'trygdeforordningen',
          beskrivelse:
            'forordning som koordinerer trygderettigheter og -plikter for personer som er omfattet av EØS-avtalens regler om fri bevegelighet',
          __typename: 'Begrep',
        },
      ],
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
            code: 'ARKIV',
            shortName: 'Arkivloven',
            __typename: 'Code',
          },
          spesifisering: 's',
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
      relevansFor: [
        {
          code: 'OKONOMISYSTEM',
          shortName: 'Behandler økonomi',
          __typename: 'Code',
        },
      ],
      status: 'AKTIV',
      suksesskriterier: [
        {
          id: 0,
          navn: 'Suksesskriterium 1',
          beskrivelse: 'Beskrivelse av suksesskriteriet',
          behovForBegrunnelse: true,
          __typename: 'Suksesskriterie',
        },
      ],
      kravIdRelasjoner: ['52dff1cf-a05c-46e2-98eb-92c3ec49300c'],
      kravRelasjoner: [
        {
          id: '52dff1cf-a05c-46e2-98eb-92c3ec49300c',
          kravNummer: 101,
          kravVersjon: 2,
          navn: 'Overføring av personopplysninger til utlandet må være lovlig',
          __typename: 'Krav',
        },
      ],
      etterlevelser: [],
      __typename: 'Krav',
    },
  },
}

// const mockKrav = {
//   data: {
//     kravById: {
//       id: '6d52e400-69af-4f50-9d2c-cc3302d8211c',
//       kravNummer: 248,
//       kravVersjon: 1,
//       changeStamp: {
//         lastModifiedBy: 'G155120 - Groseth, Lord Andre',
//         lastModifiedDate: '2024-02-14T11:20:08.190948',
//         __typename: 'ChangeStamp',
//       },
//       navn: 'Test',
//       beskrivelse: null,
//       hensikt: 'test 2',
//       notat: 'testing',
//       varselMelding: 'testing',
//       utdypendeBeskrivelse: null,
//       versjonEndringer: null,
//       aktivertDato: '2024-02-14T11:18:27.85032516',
//       dokumentasjon: [],
//       implementasjoner: null,
//       begrepIder: [],
//       begreper: [],
//       virkemidler: [],
//       virkemiddelIder: [],
//       varslingsadresser: [
//         {
//           adresse: 'Rebecca.Soraya.Gjerstad@nav.no',
//           type: 'EPOST',
//           slackChannel: null,
//           slackUser: null,
//           __typename: 'Varslingsadresse',
//         },
//       ],
//       rettskilder: [],
//       regelverk: [
//         {
//           lov: {
//             code: 'FORSKRIFT_EFORVALTNING',
//             shortName: 'eForvaltningsforskriften',
//             __typename: 'Code',
//           },
//           spesifisering: 'f',
//           __typename: 'Regelverk',
//         },
//       ],
//       tagger: [],
//       avdeling: null,
//       underavdeling: {
//         code: 'INFORMASJON',
//         shortName: 'Seksjon for informasjonsforvaltning (YTA)',
//         __typename: 'Code',
//       },
//       relevansFor: [],
//       status: 'AKTIV',
//       suksesskriterier: [
//         {
//           id: 0,
//           navn: 'errf',
//           beskrivelse: 'still testing',
//           behovForBegrunnelse: false,
//           __typename: 'Suksesskriterie',
//         },
//       ],
//       kravIdRelasjoner: [],
//       kravRelasjoner: [],
//       etterlevelser: [],
//       __typename: 'Krav',
//     },
//   },
// }

test.describe('KravCreatePage', () => {
  test('Logg inn', async ({ page }) => {
    await page.route('http://localhost:3000/', async (route) => {
      const json = [mockUserinfo]
      await route.fulfill({ json })
    })

    await page.goto('http://localhost:3000/')
    await page.getByText('Logg inn').click()
    await page.getByPlaceholder('someone@example.com').fill(mockUserinfo.email)
    await page.getByText('Next').click()

    await page.goto('http://localhost:3000/')
    await page.getByText(mockUserinfo.ident).click()
    await page.getByText(EKrav.KRAV).click()
  })

  test('Opprette krav', async ({ page }) => {
    await page.goto('http://localhost:3000/kravliste')
    await page.getByText('Nytt krav').click()

    await page.goto('http://localhost:3000/kravliste/opprett')
    await page.getByPlaceholder('Krav tittel').fill(mockKrav.data.kravById.navn)

    await page.getByText('Gi kravet en varselmelding (eks. for kommende krav)').check()
    await page.getByLabel('Forklaring til etterlevere').fill(mockKrav.data.kravById.varselMelding)

    await page.getByLabel('Hensikt').fill(mockKrav.data.kravById.hensikt)

    mockKrav.data.kravById.suksesskriterier.map(async (suksesskriterie, index) => {
      await page.getByLabel(`Suksesskriterium ${index}`).fill(suksesskriterie.navn)
      await page.getByPlaceholder(`Suksesskriterium ${index}`).fill(suksesskriterie.beskrivelse)
      !suksesskriterie.behovForBegrunnelse
        ? await page
            .getByText('Velg type besvarelse:')
            .selectOption('Bekreftelse med tekstlig begrunnelse')
        : await page.getByText('Velg type besvarelse:').selectOption('Kun bekreftelse')
    })
    await page.getByText('Suksesskriterie').click()
  })
})

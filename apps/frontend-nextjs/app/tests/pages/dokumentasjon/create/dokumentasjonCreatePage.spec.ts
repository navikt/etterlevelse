import test, { expect } from '@playwright/test'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import {
  mockNomOrganisering,
  oppretteEtterlevelsesdokument,
} from '@/tests/utils/etterlevelsesdokument'
import {
  mockAdmin,
  mockIdent,
  mockKraveier,
  mockPersonvernombud,
  mockRead,
  mockUnauthorised,
  mockWrite,
} from '@/tests/utils/roller'

const roleScenarios = [
  { name: 'admin', mockUser: mockAdmin, canEditWithoutDocumentAccess: true },
  { name: 'kraveier', mockUser: mockKraveier, canEditWithoutDocumentAccess: false },
  { name: 'lesebruker', mockUser: mockRead, canEditWithoutDocumentAccess: false },
  { name: 'skrivebruker', mockUser: mockWrite, canEditWithoutDocumentAccess: false },
  {
    name: 'personvernombud',
    mockUser: mockPersonvernombud,
    canEditWithoutDocumentAccess: false,
  },
]

test.describe('Som en admin bruker skal jeg kunne', () => {
  test('trykke «Opprett nytt etterlevelsesdokument» på forsiden og deretter bli navigert til «Opprett nytt etterlevelsesdokument» siden', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

    await context.route('**/api/codelist?refresh=false', async (route) => {
      await route.fulfill({ json: { codelist: {} } })
    })
    await context.route('**/api/team?myTeams=true', async (route) => {
      await route.fulfill({
        json: {
          pageNumber: 0,
          pageSize: 20,
          pages: 0,
          numberOfElements: 0,
          totalElements: 0,
          content: [],
        },
      })
    })
    await context.route('**/nom/avdelinger', async (route) => {
      await route.fulfill({ json: [] })
    })
    await context.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName === 'getEtterlevelseDokumentasjoner') {
        await route.fulfill({
          json: {
            data: {
              etterlevelseDokumentasjoner: {
                pageNumber: 0,
                pageSize: 20,
                pages: 0,
                numberOfElements: 0,
                totalElements: 0,
                content: [],
              },
            },
          },
        })
        return
      }

      await route.continue()
    })

    await page.goto('http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page).toHaveTitle(/Etterlevelse/)
    await expect(page.getByRole('button', { name: 'Nytt etterlevelsesdokument' })).toBeVisible()
    await page.getByRole('button', { name: 'Nytt etterlevelsesdokument' }).click()

    // The dev server may compile the create route on first navigation
    await expect(page).toHaveURL(/\/dokumentasjon\/create$/, { timeout: 15000 })
    await expect(
      page.getByRole('heading', { name: 'Opprett nytt etterlevelsesdokument' })
    ).toBeVisible({ timeout: 15000 })
  })

  test('fylle ut miniumskriteriene for «Opprett nytt etterlevelsesdokument» skjemaet og deretter opprette det', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

    await context.route('**/api/codelist?refresh=false', async (route) => {
      await route.fulfill({
        json: {
          codelist: {
            RELEVANS: [
              {
                list: 'RELEVANS',
                code: 'BEHANDLER_PERSONOPPLYSNINGER',
                shortName: EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER,
                description: 'Etterlevelsen behandler personopplysninger',
              },
            ],
          },
        },
      })
    })

    await context.route('**/api/team?myTeams=true', async (route) => {
      await route.fulfill({
        json: {
          pageNumber: 0,
          pageSize: 20,
          pages: 0,
          numberOfElements: 0,
          totalElements: 0,
          content: [],
        },
      })
    })

    await context.route('**/nom/avdelinger', async (route) => {
      await route.fulfill({
        json: [
          {
            id: oppretteEtterlevelsesdokument.departmentId,
            navn: oppretteEtterlevelsesdokument.departmentName,
          },
        ],
      })
    })

    await context.route(
      `**/nom/seksjon/avdeling/${oppretteEtterlevelsesdokument.departmentId}`,
      async (route) => {
        await route.fulfill({ json: [{ id: 'seksjon-1', navn: 'Seksjon 1' }] })
      }
    )
    await context.route('**/nom/enhet/seksjon/seksjon-1', async (route) => {
      await route.fulfill({ json: [] })
    })
    await context.route('**/etterlevelsedokumentasjon', async (route) => {
      expect(route.request().method()).toBe('POST')
      expect(route.request().postDataJSON()).toMatchObject({
        title: oppretteEtterlevelsesdokument.title,
        beskrivelse: oppretteEtterlevelsesdokument.description,
        nomOrganisering: {
          nomAvdelingId: oppretteEtterlevelsesdokument.departmentId,
          avdelingNavn: oppretteEtterlevelsesdokument.departmentName,
          seksjoner: [{ nomSeksjonId: 'seksjon-1', nomSeksjonName: 'Seksjon 1' }],
          forEtterlevelseILinje: false,
        },
        resources: [mockIdent],
        varslingsadresser: [{ type: 'EPOST', adresse: oppretteEtterlevelsesdokument.email }],
      })

      await route.fulfill({ json: { id: oppretteEtterlevelsesdokument.id } })
    })

    await page.goto('http://localhost:3000/dokumentasjon/create', { waitUntil: 'domcontentloaded' })

    const titleField = page.getByLabel('Navngi det nye dokumentet ditt')
    const relevanceCheckbox = page.getByRole('checkbox', {
      name: EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER,
    })

    await expect(relevanceCheckbox).toBeVisible()
    await relevanceCheckbox.check()
    await titleField.fill(oppretteEtterlevelsesdokument.title)
    await page
      .locator('#beskrivelse')
      .getByRole('textbox')
      .fill(oppretteEtterlevelsesdokument.description)
    await page.waitForTimeout(750)

    await page.getByRole('button', { name: 'Hva hvis jeg ikke finner person' }).click()
    await page.getByLabel('Skriv inn Nav ident dersom du ikke finner person over').fill(mockIdent)
    await page.locator('#resourcesData').getByRole('button', { name: 'Legg til' }).click()

    await page.getByRole('button', { name: 'Legg til epost' }).click()
    await page.getByRole('button', { name: 'Legg til Epost', exact: true }).click()
    await page.getByLabel('Avdeling').selectOption(oppretteEtterlevelsesdokument.departmentId)

    await expect(titleField).toHaveValue(oppretteEtterlevelsesdokument.title)

    const lineCompliance = page.getByRole('radiogroup', {
      name: 'Hvem har ansvar for etterlevelsen?',
    })
    await expect(
      lineCompliance.getByRole('radio', { name: 'Direktoratet', exact: true })
    ).toBeChecked()
    await page.getByRole('combobox', { name: 'Seksjon', exact: true }).selectOption('seksjon-1')
    await page.getByRole('button', { name: 'Opprett', exact: true }).click()

    await expect(page).toHaveURL(
      `http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`
    )
  })
})

test.describe('Ingen tilgang for uautoriserte brukere', () => {
  for (const [name, path] of [
    ['forsiden', '/'],
    ['oppretting', '/dokumentasjon/create'],
    ['lesing', `/dokumentasjon/${oppretteEtterlevelsesdokument.id}`],
    ['redigering', `/dokumentasjon/edit/${oppretteEtterlevelsesdokument.id}`],
  ]) {
    test(`bruker uten @nav.no-adresse har ikke tilgang til ${name}`, async ({ context, page }) => {
      await context.route('**/api/**', async (route) => {
        await route.fulfill({ status: 403 })
      })
      await context.route('**/graphql', async (route) => {
        await route.fulfill({ status: 403 })
      })
      await mockUnauthorised(page)

      // The authentication backend is outside this frontend test.
      await context.route('**/login?redirect_uri=**', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'text/plain',
          body: 'Unauthorized',
        })
      })

      const pageUrl = `http://localhost:3000${path}`
      const loginResponse = page.waitForResponse(
        (response) => new URL(response.url()).pathname === '/login'
      )
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })

      expect((await loginResponse).status()).toBe(401)
      await expect(page).toHaveURL(`http://localhost:3000/login?redirect_uri=${pageUrl}`)
      await expect(page.getByRole('main')).toHaveCount(0)
      await expect(page.getByRole('button', { name: mockIdent, exact: true })).toHaveCount(0)
    })
  }
})

test.describe('Tilgang til etterlevelsesdokumentasjon for alle brukerroller', () => {
  for (const role of roleScenarios) {
    test(`${role.name} kan opprette og lese, med forventet redigeringstilgang`, async ({
      context,
      page,
    }) => {
      await role.mockUser(page)

      await context.route('**/api/codelist?refresh=false', async (route) => {
        await route.fulfill({ json: { codelist: {} } })
      })

      await context.route('**/api/team?myTeams=true', async (route) => {
        await route.fulfill({
          json: {
            pageNumber: 0,
            pageSize: 20,
            pages: 0,
            numberOfElements: 0,
            totalElements: 0,
            content: [],
          },
        })
      })

      await context.route('**/nom/avdelinger', async (route) => {
        await route.fulfill({ json: [] })
      })

      await context.route(
        `**/api/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({
            json: {
              id: oppretteEtterlevelsesdokument.id,
              title: oppretteEtterlevelsesdokument.title,
              beskrivelse: oppretteEtterlevelsesdokument.description,
              status: 'UNDER_ARBEID',
              etterlevelseNummer: 1,
              nomOrganisering: mockNomOrganisering,
              etterlevelseDokumentVersjon: 1,
              resources: [],
              resourcesData: [],
              teams: [],
              teamsData: [],
              risikoeiere: [],
              risikoeiereData: [],
              irrelevansFor: [],
              varslingsadresser: [{ type: 'EPOST', adresse: oppretteEtterlevelsesdokument.email }],
              hasCurrentUserAccess: false,
            },
          })
        }
      )
      await context.route(
        `**/documentrelation/todocument/${oppretteEtterlevelsesdokument.id}**`,
        async (route) => {
          await route.fulfill({ json: [] })
        }
      )
      await context.route(
        `**/pvkdokument/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlingenslivslop/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlings-art-og-omfang/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route('**/kravprioritylist?pageNumber=0&pageSize=100', async (route) => {
        await route.fulfill({
          json: {
            pageNumber: 0,
            pageSize: 100,
            pages: 0,
            numberOfElements: 0,
            totalElements: 0,
            content: [],
          },
        })
      })

      await context.route('**/graphql', async (route) => {
        const requestBody = route.request().postDataJSON() as { operationName?: string }

        if (requestBody.operationName === 'getEtterlevelseDokumentasjonStats') {
          await route.fulfill({
            json: {
              data: {
                etterlevelseDokumentasjon: {
                  content: [{ stats: { relevantKrav: [], irrelevantKrav: [], utgaattKrav: [] } }],
                },
              },
            },
          })
          return
        }

        await route.continue()
      })

      await page.goto('http://localhost:3000/dokumentasjon/create', {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        page.getByRole('heading', { name: 'Opprett nytt etterlevelsesdokument' })
      ).toBeVisible()

      await page.goto(`http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        page.getByRole('heading', { name: `E1.1 ${oppretteEtterlevelsesdokument.title}` })
      ).toBeVisible()

      await page.getByRole('button', { name: 'Etterlevelse' }).click()
      await expect(page.getByRole('menuitem', { name: 'Eksporter til Word' })).toBeVisible()

      const editDocumentLink = page.getByRole('menuitem', {
        name: 'Rediger dokumentegenskaper',
      })
      if (role.canEditWithoutDocumentAccess) {
        await expect(editDocumentLink).toBeVisible()
      } else {
        await expect(editDocumentLink).toHaveCount(0)
      }

      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Les mer om dette dokumentet' }).click()

      if (role.canEditWithoutDocumentAccess) {
        await expect(
          page.getByRole('link', { name: oppretteEtterlevelsesdokument.email })
        ).toBeVisible()
      } else {
        await expect(
          page.getByText(/Trenger du tilgang til å redigere dette dokumentet/)
        ).toBeVisible()
        await expect(
          page.getByRole('link', { name: oppretteEtterlevelsesdokument.email })
        ).toHaveCount(0)
      }
    })
  }
})

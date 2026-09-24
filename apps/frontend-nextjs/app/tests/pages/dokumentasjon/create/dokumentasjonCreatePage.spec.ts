import test, { expect } from '@playwright/test'
import {
  mockAdmin,
  mockIdent,
  mockKraveier,
  mockPersonvernombud,
  mockRead,
  mockWrite,
} from '@/tests/utils/roller'

const createdDocument = {
  id: 'created-document-id',
  title: 'Test av nytt etterlevelsesdokument',
  description: 'Dokumentasjon opprettet fra Playwright-testen',
  departmentId: 'avdeling-1',
  departmentName: 'Testavdelingen',
  email: 'bat.man@nav.no',
  sectionName: 'Testseksjonen',
  unitName: 'Testenheten',
  riskOwnerName: 'Test Risikoeier',
  teamName: 'Testteamet',
  treatmentName: 'B101 Testformål: Testbehandling',
  dataProcessorTreatmentName: 'D202: Databehandlerbehandling',
  systemName: 'Testsystemet',
  riskAssessment: 'ROS-analyse for testdokumentet',
  p360CaseNumber: 'SAK-12345',
  reuseDescription: 'Veiledning for gjenbruk av testdokumentet',
}

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

    await page.goto('http://localhost:3000/')

    await expect(page).toHaveTitle(/Etterlevelse/)
    await expect(page.getByRole('button', { name: 'Nytt etterlevelsesdokument' })).toBeVisible()
    await page.getByRole('button', { name: 'Nytt etterlevelsesdokument' }).click()

    await expect(
      page.getByRole('heading', { name: 'Opprett nytt etterlevelsesdokument' })
    ).toBeVisible()
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
                shortName: 'Behandler personopplysninger',
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
        json: [{ id: createdDocument.departmentId, navn: createdDocument.departmentName }],
      })
    })

    await context.route(
      `**/nom/seksjon/avdeling/${createdDocument.departmentId}`,
      async (route) => {
        await route.fulfill({ json: [] })
      }
    )
    await context.route('**/etterlevelsedokumentasjon', async (route) => {
      expect(route.request().method()).toBe('POST')
      expect(route.request().postDataJSON()).toMatchObject({
        title: createdDocument.title,
        beskrivelse: createdDocument.description,
        nomAvdelingId: createdDocument.departmentId,
        avdelingNavn: createdDocument.departmentName,
        resources: [mockIdent],
        varslingsadresser: [{ type: 'EPOST', adresse: createdDocument.email }],
      })

      await route.fulfill({ json: { id: createdDocument.id } })
    })

    await page.goto('http://localhost:3000/dokumentasjon/create')

    const titleField = page.getByLabel('Navngi det nye dokumentet ditt')
    const relevanceCheckbox = page.getByRole('checkbox', {
      name: 'Behandler personopplysninger',
    })

    await expect(relevanceCheckbox).toBeVisible()
    await relevanceCheckbox.check()
    await titleField.fill(createdDocument.title)
    await page.locator('#beskrivelse').getByRole('textbox').fill(createdDocument.description)
    await page.waitForTimeout(750)

    await page.getByRole('button', { name: 'Hva hvis jeg ikke finner person' }).click()
    await page.getByLabel('Skriv inn Nav ident dersom du ikke finner person over').fill(mockIdent)
    await page.locator('#resourcesData').getByRole('button', { name: 'Legg til' }).click()

    await page.getByRole('button', { name: 'Legg til epost' }).click()
    await page.getByRole('button', { name: 'Legg til Epost', exact: true }).click()
    await page.getByLabel('Avdeling').selectOption(createdDocument.departmentId)

    await expect(titleField).toHaveValue(createdDocument.title)
    await page.getByRole('button', { name: 'Opprett', exact: true }).click()

    await expect(page).toHaveURL(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)
  })
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
        `**/api/etterlevelsedokumentasjon/${createdDocument.id}`,
        async (route) => {
          await route.fulfill({
            json: {
              id: createdDocument.id,
              title: createdDocument.title,
              beskrivelse: createdDocument.description,
              status: 'UNDER_ARBEID',
              etterlevelseNummer: 1,
              etterlevelseDokumentVersjon: 1,
              resources: [],
              resourcesData: [],
              teams: [],
              teamsData: [],
              risikoeiere: [],
              risikoeiereData: [],
              irrelevansFor: [],
              varslingsadresser: [{ type: 'EPOST', adresse: createdDocument.email }],
              hasCurrentUserAccess: false,
            },
          })
        }
      )
      await context.route(
        `**/documentrelation/todocument/${createdDocument.id}**`,
        async (route) => {
          await route.fulfill({ json: [] })
        }
      )
      await context.route(
        `**/pvkdokument/etterlevelsedokument/${createdDocument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlingenslivslop/etterlevelsedokument/${createdDocument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlings-art-og-omfang/etterlevelsedokumentasjon/${createdDocument.id}`,
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
                  content: [{ stats: { relevantKrav: [], utgaattKrav: [] } }],
                },
              },
            },
          })
          return
        }

        await route.continue()
      })

      await page.goto('http://localhost:3000/dokumentasjon/create')
      await expect(
        page.getByRole('heading', { name: 'Opprett nytt etterlevelsesdokument' })
      ).toBeVisible()

      await page.goto(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)
      await expect(
        page.getByRole('heading', { name: `E1.1 ${createdDocument.title}` })
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
        await expect(page.getByRole('link', { name: createdDocument.email })).toBeVisible()
      } else {
        await expect(
          page.getByText(/Trenger du tilgang til å redigere dette dokumentet/)
        ).toBeVisible()
        await expect(page.getByRole('link', { name: createdDocument.email })).toHaveCount(0)
      }
    })
  }
})

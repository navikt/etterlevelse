import test, { expect } from '@playwright/test'
import { mockAdmin, mockIdent } from '@/tests/utils/roller'

const createdDocument = {
  id: 'created-document-id',
  title: 'Test av nytt etterlevelsesdokument',
  description: 'Dokumentasjon opprettet fra Playwright-testen',
  departmentId: 'avdeling-1',
  departmentName: 'Testavdelingen',
  email: 'bat.man@nav.no',
}

test.describe('Som en admin bruker skal jeg kunne', () => {
  test('trykke «Opprett nytt etterlevelsesdokument» på forsiden og deretter bli navigert til «Opprett nytt etterlevelsesdokument» siden', async ({
    page,
  }) => {
    await mockAdmin(page)

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

  test('se etterlevelsesdokumentet som jeg har opprettet', async ({ context, page }) => {
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
    await context.route(`**/api/etterlevelsedokumentasjon/${createdDocument.id}`, async (route) => {
      await route.fulfill({
        json: {
          id: createdDocument.id,
          title: createdDocument.title,
          beskrivelse: createdDocument.description,
          status: 'UNDER_ARBEID',
          etterlevelseNummer: 1,
          etterlevelseDokumentVersjon: 1,
          nomAvdelingId: createdDocument.departmentId,
          avdelingNavn: createdDocument.departmentName,
          resources: [mockIdent],
          resourcesData: [
            {
              navIdent: mockIdent,
              givenName: mockIdent,
              familyName: mockIdent,
              fullName: mockIdent,
              email: mockIdent,
              resourceType: mockIdent,
            },
          ],
          varslingsadresser: [{ type: 'EPOST', adresse: createdDocument.email }],
          irrelevansFor: [],
          hasCurrentUserAccess: true,
        },
      })
    })
    await context.route(`**/documentrelation/todocument/${createdDocument.id}**`, async (route) => {
      await route.fulfill({ json: [] })
    })
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

    await page.goto(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)

    await expect(page).toHaveURL(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)
    await expect(page.getByRole('heading', { name: `E1.1 ${createdDocument.title}` })).toBeVisible()

    await page.getByRole('button', { name: 'Les mer om dette dokumentet' }).click()

    await expect(page.getByText(createdDocument.description)).toBeVisible()
    await expect(page.getByText('Behandler personopplysninger')).toBeVisible()
    await expect(page.getByText(createdDocument.departmentName)).toBeVisible()
    await expect(
      page
        .getByText('Personer:', { exact: true })
        .locator('..')
        .getByText(mockIdent, { exact: true })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: createdDocument.email })).toBeVisible()
  })
})

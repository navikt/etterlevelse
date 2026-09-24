import test, { expect } from '@playwright/test'
import { mockAdmin, mockIdent } from '@/tests/utils/roller'

test.describe('Som en admin bruker skal jeg kunne', () => {
  test('trykke «Opprett nytt etterlevelsesdokument» på forsiden og deretter bli navigert til «Opprett nytt etterlevelsesdokument» siden', async ({
    page,
  }) => {
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
    const documentId = 'created-document-id'
    const title = 'Test av nytt etterlevelsesdokument'
    const description = 'Dokumentasjon opprettet fra Playwright-testen'

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
      await route.fulfill({ json: [{ id: 'avdeling-1', navn: 'Testavdelingen' }] })
    })
    await context.route('**/nom/seksjon/avdeling/avdeling-1', async (route) => {
      await route.fulfill({ json: [] })
    })
    await context.route('**/etterlevelsedokumentasjon', async (route) => {
      expect(route.request().method()).toBe('POST')
      expect(route.request().postDataJSON()).toMatchObject({
        title,
        beskrivelse: description,
        nomAvdelingId: 'avdeling-1',
        avdelingNavn: 'Testavdelingen',
        resources: [mockIdent],
        varslingsadresser: [{ type: 'EPOST', adresse: 'bat.man@nav.no' }],
      })
      await route.fulfill({ json: { id: documentId } })
    })

    await page.goto('http://localhost:3000/dokumentasjon/create')

    await page.getByLabel('Navngi det nye dokumentet ditt').fill(title)
    await page.locator('#beskrivelse').getByRole('textbox').fill(description)
    await page.waitForTimeout(550)
    await page.getByRole('checkbox', { name: 'Behandler personopplysninger' }).check()

    await page.getByRole('button', { name: 'Hva hvis jeg ikke finner person' }).click()
    await page.getByLabel('Skriv inn Nav ident dersom du ikke finner person over').fill(mockIdent)
    await page.locator('#resourcesData').getByRole('button', { name: 'Legg til' }).click()

    await page.getByRole('button', { name: 'Legg til epost' }).click()
    await page.getByRole('button', { name: 'Legg til Epost', exact: true }).click()
    await page.getByLabel('Avdeling').selectOption('avdeling-1')

    await page.getByRole('button', { name: 'Opprett', exact: true }).click()

    await expect(page).toHaveURL(`http://localhost:3000/dokumentasjon/${documentId}`)
  })
})

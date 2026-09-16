import { expect, test } from '@playwright/test'
import { mockIdent, mockIngenEndringerEtterlevelseDokumentasjoner, mockUser } from '../mocks'

test.describe('etterlevelse tilganger', () => {
  test('admin', async ({ context, page }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
        }),
      })
    })

    await context.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockIngenEndringerEtterlevelseDokumentasjoner),
      })
    })

    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Etterlevelse/)

    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

    await page.getByRole('button', { name: mockIdent }).click()

    await expect(page.getByRole('link', { name: 'Forvalte og opprette krav' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Oversiktsside for Personvernombudet' })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administrere krav' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administrere dokumentasjon' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administrere dokument relasjon' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administrere etterlevelse' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administrere pvk dokument' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Gjenopprett slettede dokumenter' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Versjonering' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Kodeverk' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Spørsmål og svar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Varslinger' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sendt e-post log' })).toBeVisible()

    await expect(page.getByRole('button', { name: 'Endre aktive roller' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Skriv' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Kraveier' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Personvernombud' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Admin' })).toBeVisible()
  })

  test('personvernombud', async ({ page, context }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
          groups: ['PERSONVERNOMBUD', 'READ'],
        }),
      })
    })

    await context.route('**/graphql', async (route) => {
      const request = route.request()
      const requestBody = request.postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockIngenEndringerEtterlevelseDokumentasjoner),
      })
    })

    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Etterlevelse/)

    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

    await page.getByRole('button', { name: mockIdent }).click()

    await expect(
      page.getByRole('link', { name: 'Oversiktsside for Personvernombudet' })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Forvalte og opprette krav' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Administrere krav' })).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Endre aktive roller' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Personvernombud' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Skriv' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Kraveier' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Admin' })).toHaveCount(0)
  })

  test('kraveier', async ({ page, context }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
          groups: ['KRAVEIER', 'READ'],
        }),
      })
    })

    await context.route('**/graphql', async (route) => {
      const request = route.request()
      const requestBody = request.postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockIngenEndringerEtterlevelseDokumentasjoner),
      })
    })

    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Etterlevelse/)

    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

    await page.getByRole('button', { name: mockIdent }).click()

    await expect(page.getByRole('link', { name: 'Forvalte og opprette krav' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Oversiktsside for Personvernombudet' })
    ).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Administrere krav' })).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Endre aktive roller' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Kraveier' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Skriv' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Personvernombud' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Admin' })).toHaveCount(0)
  })

  test('read', async ({ page, context }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
          groups: ['READ'],
        }),
      })
    })

    await context.route('**/graphql', async (route) => {
      const request = route.request()
      const requestBody = request.postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockIngenEndringerEtterlevelseDokumentasjoner),
      })
    })

    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Etterlevelse/)

    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

    await page.getByRole('button', { name: mockIdent }).click()

    await expect(page.getByRole('link', { name: 'Forvalte og opprette krav' })).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Oversiktsside for Personvernombudet' })
    ).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Administrere krav' })).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Endre aktive roller' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Skriv' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Kraveier' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Personvernombud' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Admin' })).toHaveCount(0)
  })

  test('write', async ({ page, context }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
          groups: ['WRITE', 'READ'],
        }),
      })
    })

    await context.route('**/graphql', async (route) => {
      const request = route.request()
      const requestBody = request.postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(mockIngenEndringerEtterlevelseDokumentasjoner),
      })
    })

    await page.goto('http://localhost:3000/')
    await expect(page).toHaveTitle(/Etterlevelse/)

    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

    await page.getByRole('button', { name: mockIdent }).click()

    await expect(page.getByRole('link', { name: 'Forvalte og opprette krav' })).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Oversiktsside for Personvernombudet' })
    ).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Administrere krav' })).toHaveCount(0)

    await expect(page.getByRole('button', { name: 'Endre aktive roller' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Skriv' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Kraveier' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Personvernombud' })).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Admin' })).toHaveCount(0)
  })
})

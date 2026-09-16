import { expect, test } from '@playwright/test'
import { mockIngenEndringerEtterlevelseDokumentasjoner } from '../mocks'
import {
  mockAdmin,
  mockIdent,
  mockKraveier,
  mockPersonvernombud,
  mockRead,
  mockWrite,
} from '../roller'

test.describe('etterlevelse tilganger', () => {
  test('admin', async ({ context, page }) => {
    await mockAdmin(page)

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
    await mockPersonvernombud(page)

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
    await mockKraveier(page)

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
    await mockRead(page)

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
    await mockWrite(page)

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

import { expect, test } from '@playwright/test'
import { mockNyligeEtterlevelseDokumentasjoner } from '../utils/mocks'
import { mockAdmin, mockIdent } from '../utils/roller'

test.describe('etterlevelse main page tests', () => {
  test('front page with admin user, should load all page content', async ({ page }) => {
    await mockAdmin(page)
    await page.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
        await route.continue()
        return
      }

      await route.fulfill({ json: mockNyligeEtterlevelseDokumentasjoner })
    })

    await page.goto('http://localhost:3000/')

    await expect(page).toHaveTitle(/Etterlevelse/)
    await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()
    await expect(
      page.getByRole('combobox', { name: 'Søk etter krav, dokumentasjon eller behandling' })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'E716.1 Justice League' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nytt etterlevelsesdokument' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Alle etterlevelsesdokumenter' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Forstå kravene' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Status i organisasjonen' })).toBeVisible()
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByRole('link', { name: 'Om etterlevelse på Navet' })).toBeVisible()
    await expect(
      footer.getByRole('link', { name: 'Behandlingskatalogen', exact: true })
    ).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Oversikt over løsningene' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Om Støtte til etterlevelse' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Om Digital PVK' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Om Behandlingskatalogen' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Slack' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Github' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Teamkatalogen' })).toBeVisible()
  })
})

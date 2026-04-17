import { expect, test } from '@playwright/test'

test.describe('TillatGjenbrukModal', () => {
  test('disables Slå på gjenbruk when required fields are missing', async ({ page }) => {
    await page.goto('/e2e/tillat-gjenbruk')

    await expect(
      page.getByRole('heading', { name: 'Slå på gjenbruk av dette dokumentet' })
    ).toBeVisible({ timeout: 30_000 })

    await expect(
      page.getByText(
        'Dere må oppdatere følgende felt i dokumentegenskaper før dere kan slå på gjenbruk.'
      )
    ).toBeVisible({ timeout: 30_000 })

    await expect(page.getByRole('button', { name: 'Slå på gjenbruk' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Lagre til senere' })).toBeEnabled()
  })
})

import { test } from '@playwright/test'

test.describe('KravEditPage', () => {
  test('test', async ({ page }) => {
    await page.goto('https://etterlevelse.intern.dev.nav.no/')
    await page.getByText('Logg inn').click()
    await page.getByPlaceholder('someone@example.com').fill('someone@nav.no')
    await page.getByText('Next').click()
    await page.goto('https://etterlevelse.intern.dev.nav.no/')

    await page.goto('https://etterlevelse.intern.dev.nav.no/kravliste')

    await page.getByText('Nytt krav').click()
    await page.goto('https://etterlevelse.intern.dev.nav.no/kravliste/opprett')

    // await page.goto('https://etterlevelse.intern.dev.nav.no/krav/redigering/6d52e400-69af-4f50-9d2c-cc3302d8211c')
    // await page.goto('https://etterlevelse.intern.dev.nav.no/krav/redigering/249/1/')
  })
})

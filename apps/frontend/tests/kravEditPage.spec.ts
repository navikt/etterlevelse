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
  kravTittel: 'Krav tittel',
  kravSuksesskriteriumNavn: 'Suksesskriterium navn',
}

test.describe('KravEditPage', () => {
  test('Rediger krav', async ({ page }) => {
    await page.route('https://etterlevelse.intern.dev.nav.no/', async (route) => {
      const json = [mockUserinfo]
      await route.fulfill({ json })
    })

    await page.goto('https://etterlevelse.intern.dev.nav.no/')
    await page.getByText('Logg inn').click()
    await page.getByPlaceholder('someone@example.com').fill(mockUserinfo.email)
    await page.getByText('Next').click()

    await page.goto('https://etterlevelse.intern.dev.nav.no/')
    await page.getByText(mockUserinfo.ident).click()
    await page.getByText(EKrav.KRAV).click()

    await page.goto('https://etterlevelse.intern.dev.nav.no/kravliste')

    await page.goto(
      'https://etterlevelse.intern.dev.nav.no/krav/redigering/6d52e400-69af-4f50-9d2c-cc3302d8211c'
    )
    await page.goto('https://etterlevelse.intern.dev.nav.no/krav/redigering/249/1/')
    await page.getByPlaceholder('Krav tittel').fill(mockKrav.kravTittel)
    await page.getByPlaceholder('Navn').fill(mockKrav.kravSuksesskriteriumNavn)
  })
})

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

test.describe('KravCreatePage', () => {
  test('Opprette krav', async ({ page }) => {
    await page.route('http://localhost:3000/', async (route) => {
      const json = [mockUserinfo]
      await route.fulfill({ json })
    })

    await page.goto('http://localhost:3000/')
    await page.getByText('Logg inn').click()
    await page.getByPlaceholder('someone@example.com').fill(mockUserinfo.email)
    await page.getByText('Next').click()

    await page.goto('http://localhost:3000/')
    await page.getByText(mockUserinfo.ident).click()
    await page.getByText(EKrav.KRAV).click()

    await page.goto('http://localhost:3000/kravliste')
    await page.getByText('Nytt krav').click()

    await page.goto('http://localhost:3000/kravliste/opprett')
    await page.getByPlaceholder('Krav tittel').fill(mockKrav.kravTittel)
    await page.getByPlaceholder('Navn').fill(mockKrav.kravSuksesskriteriumNavn)
  })
})

import { expect, test } from '@playwright/test'

test('front page etterlevelse', async ({ page }) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        loggedIn: true,
        ident: 'Z123456',
        name: 'Test, User',
        email: 'test.user@nav.no',
        groups: ['READ'],
      }),
    })
  })

  await page.goto('http://localhost:3000/')

  await expect(page).toHaveTitle(/Etterlevelse/)
  await expect(page.getByRole('button', { name: 'Z123456' })).toBeVisible()
})

test('navigation dokumentere etterlevelse', async ({ page }) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        loggedIn: true,
        ident: 'Z123456',
        name: 'Test, User',
        email: 'test.user@nav.no',
        groups: ['READ'],
      }),
    })
  })
  await page.route('**/api/codelist?refresh=false', async (route) => {
    await route.fulfill({ json: { codelist: {} } })
  })
  await page.route('**/api/team?myTeams=true', async (route) => {
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
  await page.route('**/graphql', async (route) => {
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
  })

  await page.goto('http://localhost:3000/')

  await expect(page).toHaveTitle(/Etterlevelse/)
  await expect(page.getByRole('button', { name: 'Z123456' })).toBeVisible()

  await page.getByRole('button', { name: 'Meny' }).click()
  await expect(page.getByRole('link', { name: 'Dokumentere etterlevelse' })).toHaveAttribute(
    'href',
    '/dokumentasjoner'
  )
  await page.goto('http://localhost:3000/dokumentasjoner', { waitUntil: 'commit' })

  await expect(page.getByRole('heading', { name: 'Dokumentere etterlevelse' })).toBeVisible()
})

test('navigation krav', async ({ context, page }) => {
  await context.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        loggedIn: true,
        ident: 'Z123456',
        name: 'Test, User',
        email: 'test.user@nav.no',
        groups: ['READ', 'WRITE', 'ADMIN'],
      }),
    })
  })
  await context.route('**/api/codelist?refresh=false', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ codelist: {} }),
    })
  })
  await context.route('**/api/team?myTeams=true', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        pageNumber: 0,
        pageSize: 20,
        pages: 0,
        numberOfElements: 0,
        totalElements: 0,
        content: [],
      }),
    })
  })
  await context.route('**/api/etterlevelsedokumentasjon/umami-etterlevelse', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'umami-etterlevelse',
        title: 'krav',
        etterlevelseNummer: 123,
        etterlevelseDokumentVersjon: 1,
        hasCurrentUserAccess: true,
        changeStamp: {
          createdDate: '2026-01-01T00:00:00.000Z',
          lastModifiedDate: '2026-01-01T00:00:00.000Z',
          lastModifiedBy: 'Z123456',
        },
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
      body: JSON.stringify({
        data: {
          etterlevelseDokumentasjoner: {
            pageNumber: 0,
            pageSize: 20,
            pages: 1,
            numberOfElements: 1,
            totalElements: 1,
            content: [
              {
                id: 'umami-etterlevelse',
                title: 'krav',
                etterlevelseNummer: 123,
                etterlevelseDokumentVersjon: 1,
                hasCurrentUserAccess: true,
                sistEndretEtterlevelse: null,
                sistEndretEtterlevelseAvMeg: null,
                sistEndretDokumentasjonAvMeg: null,
                changeStamp: { createdDate: '2026-01-01T00:00:00.000Z' },
                teamsData: [],
              },
            ],
          },
        },
      }),
    })
  })

  await page.goto('http://localhost:3000/')

  await expect(page).toHaveTitle(/Etterlevelse/)
  await expect(page.getByRole('button', { name: 'Z123456' })).toBeVisible()

  await page.getByRole('button', { name: 'Meny' }).click()
  await expect(page.getByRole('link', { name: 'Dokumentere etterlevelse' })).toHaveAttribute(
    'href',
    '/dokumentasjoner'
  )
  await page.goto('http://localhost:3000/dokumentasjoner')

  await expect(page.getByRole('heading', { name: 'Dokumentere etterlevelse' })).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Mine dokumentasjoner', selected: true })
  ).toBeVisible()

  await page.getByRole('tab', { name: 'Alle' }).click()
  await expect(page).toHaveURL('http://localhost:3000/dokumentasjoner?tab=alle')
  await expect(page.getByRole('tab', { name: 'Alle', selected: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'E123.1 krav', exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'E123.1 krav', exact: true }).click()
  await expect(page).toHaveURL('http://localhost:3000/dokumentasjon/umami-etterlevelse')
  await expect(page.getByRole('heading', { name: 'E123.1 krav', exact: true })).toBeVisible()
})

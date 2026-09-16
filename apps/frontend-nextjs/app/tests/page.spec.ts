import { expect, test } from '@playwright/test'
import { mockIdent, mockNyligeEtterlevelseDokumentasjoner, mockUser } from './mocks'

test.describe('etterlevelse', () => {
  test('front page', async ({ page }) => {
    await page.route('**/userinfo', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockUser,
        }),
      })
    })
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

  test.describe('nagivation', () => {
    test('dokumentere etterlevelse', async ({ page }) => {
      await page.route('**/userinfo', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockUser,
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
      await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

      await page.getByRole('button', { name: 'Meny' }).click()
      await expect(page.getByRole('link', { name: 'Dokumentere etterlevelse' })).toHaveAttribute(
        'href',
        '/dokumentasjoner'
      )
      await page.goto('http://localhost:3000/dokumentasjoner', { waitUntil: 'commit' })

      await expect(page.getByRole('heading', { name: 'Dokumentere etterlevelse' })).toBeVisible()
    })

    test('krav', async ({ context, page }) => {
      await context.route('**/userinfo', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockUser,
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
      await context.route('**/api/etterlevelsedokumentasjon/1234-1234-1234-1234', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockNyligeEtterlevelseDokumentasjoner.data.etterlevelseDokumentasjoner.content[0],
          }),
        })
      })
      await context.route('**/documentrelation/todocument/1234-1234-1234-1234**', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      })
      await context.route(
        '**/pvkdokument/etterlevelsedokument/1234-1234-1234-1234',
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        '**/behandlingenslivslop/etterlevelsedokument/1234-1234-1234-1234',
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        '**/behandlings-art-og-omfang/etterlevelsedokumentasjon/1234-1234-1234-1234',
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route('**/kravprioritylist?pageNumber=0&pageSize=100', async (route) => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            pageNumber: 0,
            pageSize: 100,
            pages: 1,
            numberOfElements: 0,
            totalElements: 0,
            content: [],
          }),
        })
      })
      await context.route('**/graphql', async (route) => {
        const request = route.request()
        const requestBody = request.postDataJSON() as { operationName?: string }

        if (requestBody.operationName === 'getEtterlevelseDokumentasjonStats') {
          await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                etterlevelseDokumentasjon: {
                  content: [{ stats: { relevantKrav: [], utgaattKrav: [] } }],
                },
              },
            }),
          })
          return
        }

        if (requestBody.operationName !== 'getEtterlevelseDokumentasjoner') {
          await route.continue()
          return
        }

        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockNyligeEtterlevelseDokumentasjoner,
          }),
        })
      })

      await page.goto('http://localhost:3000/')

      await expect(page).toHaveTitle(/Etterlevelse/)
      await expect(page.getByRole('button', { name: mockIdent })).toBeVisible()

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
      await expect(page.getByRole('link', { name: /^E716\.1 Justice League/ })).toBeVisible()

      await page.getByRole('link', { name: /^E716\.1 Justice League/ }).click()
      await expect(page).toHaveURL('http://localhost:3000/dokumentasjon/1234-1234-1234-1234')
      await expect(
        page.getByRole('heading', { name: 'E716.1 Justice League', exact: true })
      ).toBeVisible()
    })
  })
})

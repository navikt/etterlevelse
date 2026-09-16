import { mockNyligeEtterlevelseDokumentasjoner } from '@/tests/utils/mocks'
import { mockAdmin, mockIdent } from '@/tests/utils/roller'
import test, { expect } from '@playwright/test'

test.describe('nagivation to dokumentasjon page', () => {
  test('go to dokumentere etterlevelse list page with admin user via menu buttons', async ({
    page,
  }) => {
    await mockAdmin(page)

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

    await page.getByRole('link', { name: 'Dokumentere etterlevelse' }).click()

    await expect(page.getByRole('heading', { name: 'Dokumentere etterlevelse' })).toBeVisible()
  })

  test('go to etterlevelse dokumentasjon page with admin user via menu button', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

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

    await Promise.all([
      page.waitForResponse((response) => {
        if (!response.url().endsWith('/graphql')) return false

        const requestBody = response.request().postDataJSON() as {
          operationName?: string
          variables?: { mineEtterlevelseDokumentasjoner?: boolean }
        }
        return (
          requestBody.operationName === 'getEtterlevelseDokumentasjoner' &&
          requestBody.variables?.mineEtterlevelseDokumentasjoner === true
        )
      }),
      page.getByRole('link', { name: 'Dokumentere etterlevelse' }).click(),
    ])

    await expect(page.getByRole('heading', { name: 'Dokumentere etterlevelse' })).toBeVisible()
    await expect(
      page.getByRole('tab', { name: 'Mine dokumentasjoner', selected: true })
    ).toBeVisible()

    await expect(page.getByRole('tab', { name: 'Alle', selected: false })).toBeVisible()

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

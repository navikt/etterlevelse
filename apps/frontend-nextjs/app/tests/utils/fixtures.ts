import { test as base, expect } from '@playwright/test'

export const frontendUrl = 'http://127.0.0.1:3100'

export const test = base.extend<{ dataIsolation: void }>({
  dataIsolation: [
    async ({ context }, use) => {
      const unmockedRequests: string[] = []
      await context.route('**/*', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        if (request.resourceType() === 'font') {
          await route.abort('blockedbyclient')
          return
        }
        if (
          url.origin === frontendUrl &&
          !url.pathname.startsWith('/api/') &&
          !['/graphql', '/userinfo', '/login', '/logout', '/_next/image'].includes(url.pathname)
        ) {
          await route.continue()
          return
        }
        unmockedRequests.push(`${request.method()} ${request.url()} ${request.postData() ?? ''}`)
        await route.abort('blockedbyclient')
      })
      const emptyPage = {
        pageNumber: 0,
        pageSize: 20,
        pages: 0,
        numberOfElements: 0,
        totalElements: 0,
        content: [],
      }
      await context.route('**/api/melding/type/*', (route) => route.fulfill({ json: emptyPage }))
      await context.route('**/api/codelist?refresh=false', (route) =>
        route.fulfill({ json: { codelist: {} } })
      )
      await context.route('**/api/team?myTeams=true', (route) => route.fulfill({ json: emptyPage }))
      await context.route('**/api/team', (route) => route.fulfill({ json: emptyPage }))
      await context.route('**/api/team/productarea?myProductAreas=true', (route) =>
        route.fulfill({ json: emptyPage })
      )
      await context.route('**/api/team/resource/*/photo', async (route) => {
        await route.fulfill({
          contentType: 'image/png',
          body: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
            'base64'
          ),
        })
      })
      await use()
      expect(unmockedRequests, 'Alle dataforespørsler skal være mocket').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

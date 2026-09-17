import { Page } from '@playwright/test'

export const mockIdent = 'Z123456'

const mockUser = {
  loggedIn: true,
  ident: mockIdent,
  name: 'Bat, Man',
  email: 'bat.man@nav.no',
  groups: ['ADMIN', 'WRITE', 'READ'],
}

export const mockAdmin = async (page: Page) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
      }),
    })
  })
}

export const mockKraveier = async (page: Page) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
        groups: ['KRAVEIER', 'READ'],
      }),
    })
  })
}

export const mockRead = async (page: Page) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
        groups: ['READ'],
      }),
    })
  })
}

export const mockWrite = async (page: Page) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
        groups: ['WRITE', 'READ'],
      }),
    })
  })
}

export const mockPersonvernombud = async (page: Page) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
        groups: ['PERSONVERNOMBUD', 'READ'],
      }),
    })
  })
}

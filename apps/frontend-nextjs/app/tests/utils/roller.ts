import { BrowserContext, Page } from '@playwright/test'

export const mockIdent = 'Z123456'

const mockUser = {
  loggedIn: true,
  ident: mockIdent,
  name: 'Bat, Man',
  email: 'bat.man@nav.no',
  groups: ['ADMIN', 'WRITE', 'READ'],
}

const mockUserUnauthorised = {
  loggedIn: false,
  ident: '',
  name: 'Batman',
  email: 'batman@cave.inc',
  groups: [],
}

export const mockUnauthorised = async (page: Page | BrowserContext) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(mockUserUnauthorised),
    })
  })
}

export const mockAdmin = async (page: Page | BrowserContext) => {
  await page.route('**/userinfo', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ...mockUser,
      }),
    })
  })
}

export const mockKraveier = async (page: Page | BrowserContext) => {
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

export const mockRead = async (page: Page | BrowserContext) => {
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

export const mockWrite = async (page: Page | BrowserContext) => {
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

export const mockPersonvernombud = async (page: Page | BrowserContext) => {
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

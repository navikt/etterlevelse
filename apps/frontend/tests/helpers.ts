import { Page, expect } from '@playwright/test'

export const goToAzure = async (page: Page, path = '') => {
  const res = await page.goto('https://login.microsoftonline.com')
  expect(res).not.toBeNull()
  const url = res?.url()
  expect(url).toBeDefined()
  expect(url).toMatch('https://login.microsoftonline.com')
  return page
}

export const getLoggedInPage = async (page: Page, { username, password }, path = '') => {
  //   const azurePage = await goToAzure(page, path)
  // Fill in username.
  await page.fill('input[type=email][name=loginfmt]', username)

  // Click "Next".
  await page.click('input[type=submit]')

  // Fill in password.
  await page.fill('input[type=password][tabindex="0"]', password)

  // Click "Sign in".
  await page.click('input[type=submit]')

  // Click "Next"
  await page.click('input[type=submit]')

  // Click "No" to remember login.
  await page.click('input[type=button]')

  // Force navigation to local domain, if not using dev domain.
  //   if (!USE_DEV) {
  //     await page.goto(`${LOCAL_DOMAIN}${path}`)
  //   }

  //   // Browser should be redirected to KABAL.
  //   expect(page.url()).toMatch(`${UI_DOMAIN}${path}`)

  return page
}

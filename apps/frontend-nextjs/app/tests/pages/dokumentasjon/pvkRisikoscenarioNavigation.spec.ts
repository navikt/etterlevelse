import { expect, test } from '@playwright/test'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { mockIdent } from '@/tests/utils/roller'

const dokumentasjonId = 'pvk-navigation-document'
const pvkDokumentId = 'pvk-navigation-pvk'
const baseUrl = `http://localhost:3000/dokumentasjon/${dokumentasjonId}/pvkdokument/${pvkDokumentId}`
const changeStamp = {
  lastModifiedDate: '2026-10-26T10:00:00Z',
  lastModifiedBy: mockIdent,
}
const risikoscenarioer: IRisikoscenario[] = ['Første risiko', 'Andre risiko'].map(
  (navn, index) => ({
    id: `risiko-${index + 1}`,
    changeStamp,
    version: 1,
    pvkDokumentId,
    navn,
    beskrivelse: 'Beskrivelse av risiko',
    sannsynlighetsNivaa: 2,
    sannsynlighetsNivaaBegrunnelse: 'Begrunnelse for sannsynlighet',
    konsekvensNivaa: 2,
    konsekvensNivaaBegrunnelse: 'Begrunnelse for konsekvens',
    relevanteKravNummer: [],
    generelScenario: true,
    tiltakOppdatert: false,
    ingenTiltak: false,
    sannsynlighetsNivaaEtterTiltak: 0,
    konsekvensNivaaEtterTiltak: 0,
    nivaaBegrunnelseEtterTiltak: '',
    tiltakIds: ['tiltak-1'],
  })
)
const vurderteRisikoscenarioer: IRisikoscenario[] = Array.from({ length: 6 }, (_, index) => ({
  ...risikoscenarioer[0],
  id: `vurdert-${index + 1}`,
  navn: `Vurdert risiko ${index + 1}`,
  sannsynlighetsNivaaEtterTiltak: 1,
  konsekvensNivaaEtterTiltak: 1,
  nivaaBegrunnelseEtterTiltak: 'Vurdert',
}))
const alleRisikoscenarioer: IRisikoscenario[] = [...vurderteRisikoscenarioer, ...risikoscenarioer]
const emptyPage = {
  pageNumber: 0,
  pageSize: 20,
  pages: 0,
  numberOfElements: 0,
  totalElements: 0,
  content: [],
}

test.beforeEach(async ({ context }) => {
  await context.route('**/userinfo', (route) =>
    route.fulfill({
      json: {
        loggedIn: true,
        ident: mockIdent,
        name: 'Test Admin',
        email: 'test.admin@nav.no',
        groups: ['ADMIN', 'WRITE', 'READ'],
      },
    })
  )
  await context.route('**/api/codelist?refresh=false', (route) =>
    route.fulfill({ json: { codelist: {} } })
  )
  await context.route('**/api/team?myTeams=true', (route) => route.fulfill({ json: emptyPage }))
  await context.route('**/graphql', (route) =>
    route.fulfill({ json: { data: { krav: emptyPage } } })
  )
  await context.route(`**/api/etterlevelsedokumentasjon/${dokumentasjonId}`, (route) =>
    route.fulfill({
      json: {
        id: dokumentasjonId,
        changeStamp,
        version: 1,
        title: 'PVK-navigasjon',
        status: 'UNDER_ARBEID',
        etterlevelseNummer: 1,
        etterlevelseDokumentVersjon: 1,
        hasCurrentUserAccess: true,
        behandlinger: [],
        behandlingIds: [],
        dpBehandlinger: [],
        resources: [mockIdent],
        resourcesData: [],
        teams: [],
        teamsData: [],
        risikoeiere: [mockIdent],
        risikoeiereData: [{ navIdent: mockIdent, fullName: 'Test Risikoeier' }],
        nomAvdelingId: 'avdeling-1',
        seksjoner: [],
        enheter: [],
        varslingsadresser: [],
        irrelevansFor: [],
        ardoqSystemIds: [],
        risikovurderinger: [],
      },
    })
  )
  await context.route(`**/api/pvkdokument/${pvkDokumentId}`, (route) =>
    route.fulfill({
      json: {
        id: pvkDokumentId,
        changeStamp,
        etterlevelseDokumentId: dokumentasjonId,
        status: 'UNDERARBEID',
        pvkVurdering: 'LEGGE_OVER_EKSISTERENDE',
        hasPvkDocumentationStarted: true,
      },
    })
  )
  await context.route(`**/api/pvotilbakemelding/**`, (route) => route.fulfill({ status: 404 }))
  await context.route(`**/api/behandlingens-art-og-omfang/**`, (route) =>
    route.fulfill({ status: 404 })
  )
  await context.route(`**/api/behandlingenslivslop/**`, (route) => route.fulfill({ status: 404 }))
  await context.route(`**/api/risikoscenario/pvkdokument/${pvkDokumentId}/ALL`, (route) =>
    route.fulfill({
      json: {
        ...emptyPage,
        content: alleRisikoscenarioer,
        numberOfElements: alleRisikoscenarioer.length,
        totalElements: alleRisikoscenarioer.length,
      },
    })
  )
  await context.route(`**/api/tiltak/pvkdokument/${pvkDokumentId}`, (route) =>
    route.fulfill({ json: emptyPage })
  )
})

test('åpner og fokuserer risikoscenarioet fra lenken etter at data er lastet', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 400 })
  await page.goto(
    `${baseUrl}?steg=7&tab=risikoscenarioer&filter=ikke-vurdert&risikoscenario=risiko-2`
  )

  const selectedHeader = page.getByRole('button', { name: 'Andre risiko', exact: false })
  await expect(selectedHeader).toHaveAttribute('aria-expanded', 'true')
  await expect(selectedHeader).toBeFocused()
  await expect(selectedHeader).toBeInViewport()
  await page.waitForTimeout(1000)
  await expect(selectedHeader).toBeInViewport()
  const headerTop = await selectedHeader.evaluate((el) => el.getBoundingClientRect().top)
  expect(headerTop).toBeLessThan(200)
  await expect(page.getByRole('button', { name: 'Første risiko', exact: false })).toHaveAttribute(
    'aria-expanded',
    'false'
  )

  await selectedHeader.click()
  await expect(selectedHeader).toHaveAttribute('aria-expanded', 'false')
  await expect(page).not.toHaveURL(/risikoscenario=/)

  await page.getByRole('button', { name: 'Første risiko', exact: false }).click()
  await expect(page.getByRole('button', { name: 'Første risiko', exact: false })).toBeFocused()
  await expect(page).toHaveURL(/risikoscenario=risiko-1/)
})

test('lar risikoscenarioene være lukket når lenken bare har et filter', async ({ page }) => {
  await page.goto(`${baseUrl}?steg=7&tab=risikoscenarioer&filter=ikke-vurdert`)

  for (const risiko of risikoscenarioer) {
    await expect(page.getByRole('button', { name: risiko.navn, exact: false })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  }
})

test('valideringsfeil lenker til hvert enkelt risikoscenario', async ({ page, context }) => {
  await page.goto(`${baseUrl}?steg=8`)
  await page.getByRole('button', { name: 'Lagre og send til risikoeier' }).click()

  const errorSummary = page.getByRole('heading', {
    name: 'Du må rette disse feilene før du kan fortsette',
  })
  await expect(errorSummary).toBeVisible()

  for (const risiko of risikoscenarioer) {
    const errorLink = page.getByRole('link', {
      name: `Risikoscenarioet "${risiko.navn}" savner en vurdering av tiltakenes effekt.`,
      exact: false,
    })
    await expect(errorLink).toHaveAttribute(
      'href',
      `${new URL(baseUrl).pathname}?steg=7&tab=risikoscenarioer&filter=ikke-vurdert&risikoscenario=${risiko.id}`
    )

    await page.bringToFront()
    const newPagePromise = context.waitForEvent('page')
    await errorLink.press('Enter')
    const newPage = await newPagePromise
    const header = newPage.getByRole('button', { name: risiko.navn, exact: false })
    await expect(header).toHaveAttribute('aria-expanded', 'true')
    await expect(header).toBeFocused()
    await expect(header).toBeInViewport()
    await newPage.close()
  }
})

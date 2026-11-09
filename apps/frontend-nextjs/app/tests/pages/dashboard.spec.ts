import { expect, test } from '@playwright/test'
import {
  IDashboardDetailResponse,
  IDashboardTable,
  ITemaDashboardStats,
} from '../../constants/dashboard/dashboardConstants'
import { EEtterlevelseDokumentasjonStatus } from '../../constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
} from '../../constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { mockAdmin } from '../utils/roller'

const avdelingId = 'arbeids_og_velferdsdirektor'
const documents: IDashboardTable[] = [
  {
    etterlevelseDokumentasjonId: 'dashboard-alpha',
    etterlevelseDokumentasjonTittel: 'Alpha',
    etterlevelseNummer: 100,
    etterlevelseDokumentVersjon: 1,
    etterlevelseDokumentasjonStatus: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
    teams: [],
    resources: [],
    risikoeiere: [],
    seksjoner: [],
    enheter: [{ nomEnhetId: 'enhet-1', nomEnhetName: 'Enhet 1' }],
    behandlerPersonopplysninger: true,
    antallKrav: 4,
    antallOppfyltKrav: 2,
    oppfyltKravProsent: 75,
    antallSuksesskriterierOppfylt: 3,
    antallSuksesskriterierIkkeOppfylt: 1,
    sistOppdatertEtterlevelse: '2026-01-01',
    hasPvkDocumentationStarted: true,
    pvkVurdering: EPvkVurdering.SKAL_UTFORE,
    pvkStatus: EPvkDokumentStatus.UNDERARBEID,
    antallRisikoscenario: 2,
    antallTiltak: 2,
    sistOppdatertPvk: '2026-01-02',
  },
  {
    etterlevelseDokumentasjonId: 'dashboard-beta',
    etterlevelseDokumentasjonTittel: 'Beta',
    etterlevelseNummer: 200,
    etterlevelseDokumentVersjon: 2,
    etterlevelseDokumentasjonStatus: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
    teams: [],
    resources: [],
    risikoeiere: [],
    seksjoner: [],
    enheter: [],
    behandlerPersonopplysninger: false,
    antallKrav: 3,
    antallOppfyltKrav: 1,
    oppfyltKravProsent: 50,
    antallSuksesskriterierOppfylt: 1,
    antallSuksesskriterierIkkeOppfylt: 1,
    sistOppdatertEtterlevelse: '2026-02-01',
    hasPvkDocumentationStarted: false,
    pvkVurdering: EPvkVurdering.UNDEFINED,
    pvkStatus: EPvkDokumentStatus.UNDERARBEID,
    antallRisikoscenario: 1,
    antallTiltak: 1,
    sistOppdatertPvk: '2026-02-02',
  },
]

const stats = {
  avdelingId,
  avdelingNavn: 'Arbeids- og velferdsdirektoratet',
  dokumenter: { total: 2, underArbeid: 2, sendtTilGodkjenning: 0, godkjentAvRisikoeier: 0 },
  suksesskriterier: {
    total: 6,
    ikkePaabegyntAntall: 0,
    underArbeidAntall: 0,
    oppfyltAntall: 4,
    ikkeOppfyltAntall: 2,
    ikkeRelevantAntall: 0,
    ikkePaabegyntProsent: 0,
    underArbeidProsent: 0,
    oppfyltProsent: 67,
    ikkeOppfyltProsent: 33,
    ikkeRelevantProsent: 0,
  },
  behovForPvk: {
    totalMedPersonopplysninger: 1,
    ikkeVurdertBehov: 0,
    vurdertIkkeBehov: 0,
    behovIkkePaabegynt: 1,
    overforerGodkjentPvk: 0,
  },
  pvk: {
    total: 1,
    ikkePaabegynt: 0,
    underArbeid: 1,
    tilBehandlingHosPvo: 0,
    tilbakemeldingFraPvo: 0,
    sendtTilGodkjenning: 0,
    godkjentAvRisikoeier: 0,
    pvkIWord: 0,
  },
  seksjoner: [],
  statsBySeksjon: new Map(),
} satisfies IDashboardDetailResponse

const temaStats: ITemaDashboardStats = {
  temaCode: 'ARKIV',
  temaName: 'Arkiv',
  kravAntallPerTema: 7,
  kravTotal: 7,
  kravIkkePaabegynt: 0,
  kravUnderArbeid: 4,
  kravFerdigVurdert: 3,
  suksesskriterierUnderArbeid: 0,
  suksesskriterierOppfylt: 4,
  suksesskriterierIkkeOppfylt: 2,
  suksesskriterierIkkeRelevant: 0,
  suksesskriterierIkkePaabegynt: 0,
  etterlevelseDokumentCount: 2,
}

test.beforeEach(async ({ page }) => {
  await mockAdmin(page)
  await page.route('**/dashboard**', async (route) => {
    const request = route.request()
    if (!['fetch', 'xhr'].includes(request.resourceType())) {
      await route.continue()
      return
    }

    const { pathname } = new URL(request.url())
    if (pathname.includes('/dashboard/table/')) {
      await route.fulfill({ json: documents })
    } else if (pathname.endsWith(`/dashboard/avdeling/${avdelingId}`)) {
      await route.fulfill({ json: { ...stats, statsBySeksjon: {} } })
    } else if (pathname.endsWith('/dashboard/tema')) {
      await route.fulfill({ json: [temaStats] })
    } else if (pathname.endsWith('/dashboard/krav/ARKIV')) {
      await route.fulfill({ json: [] })
    } else if (pathname.endsWith('/dashboard')) {
      await route.fulfill({ json: [stats] })
    } else {
      await route.continue()
    }
  })
})

for (const path of [
  `/dashboard/${avdelingId}`,
  `/dashboard/${avdelingId}?tab=krav`,
  `/dashboard/${avdelingId}?tab=pvk`,
  '/dashboard/tema/ARKIV?tab=etterlevelsesdokumenter',
]) {
  test(`loading skeleton is replaced by documents on ${path}`, async ({ page }) => {
    const responseReady = Promise.withResolvers<void>()
    await page.route('**/dashboard/table/**', async (route) => {
      await responseReady.promise
      await route.fulfill({ json: documents })
    })

    try {
      await page.goto(`http://localhost:3000${path}`)
      const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
      await expect(table).toHaveAttribute('aria-busy', 'true')
      const skeletonRows = table.locator('tbody tr[aria-hidden="true"]')
      await expect(skeletonRows).toHaveCount(5)
      await expect(skeletonRows.first().locator('.aksel-skeleton').first()).toBeVisible()
      await expect(table.getByText('Laster etterlevelsesdokumenter')).toHaveCount(1)
      await expect(table.getByText('Ingen treff på valgte filtre')).toHaveCount(0)
      await expect(table.getByRole('columnheader').first().getByRole('button')).toBeDisabled()
      await expect(table.getByRole('link')).toHaveCount(0)

      responseReady.resolve()
      await expect(table).not.toHaveAttribute('aria-busy', 'true')
      await expect(skeletonRows).toHaveCount(0)
      await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toBeVisible()
      await expect(table.getByRole('columnheader').first().getByRole('button')).toBeEnabled()
    } finally {
      responseReady.resolve()
    }
  })

  test(`sort icons remain visible without hovering on ${path}`, async ({ page }) => {
    await page.goto(`http://localhost:3000${path}`)
    const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
    await expect(table).toBeVisible()
    await expect(table).not.toHaveAttribute('aria-busy', 'true')
    await page.mouse.move(0, 0)
    const icons = table.locator('.aksel-data-table__th-sort-icon')
    await expect(icons).toHaveCount(await table.getByRole('columnheader').count())
    for (const icon of await icons.all()) {
      await expect(icon).toBeVisible()
      await expect(icon).toHaveAttribute('data-sort-direction', 'none')
    }
  })
}

test('theme document DataGrid shows a skeleton while refreshing filtered documents', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/dashboard/tema/ARKIV?tab=etterlevelsesdokumenter')
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toBeVisible()
  const responseReady = Promise.withResolvers<void>()
  await page.route('**/dashboard/table/tema/**', async (route) => {
    await responseReady.promise
    await route.fulfill({ json: [documents[1]] })
  })

  try {
    await page
      .getByRole('combobox', { name: 'Filtrer etter avdeling' })
      .first()
      .selectOption(avdelingId)
    await expect(table).toHaveAttribute('aria-busy', 'true')
    await expect(table.locator('tbody tr[aria-hidden="true"]')).toHaveCount(5)
    await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toHaveCount(0)
    responseReady.resolve()
    await expect(table).not.toHaveAttribute('aria-busy', 'true')
    await expect(table.getByRole('link', { name: 'E200.2 Beta' })).toBeVisible()
    await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toHaveCount(0)
    await expect(page).toHaveURL(new RegExp(`avdeling=${avdelingId}`))
  } finally {
    responseReady.resolve()
  }
})

test('department DataGrids preserve columns, sorting, links and popovers across tabs', async ({
  page,
}) => {
  await page.goto(`http://localhost:3000/dashboard/${avdelingId}`)
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table).toHaveClass(/aksel-data-table/)
  await expect(table.getByRole('columnheader')).toHaveCount(10)
  await expect(table.getByRole('columnheader', { name: 'Enhet', exact: true })).toBeVisible()
  await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toHaveAttribute(
    'href',
    '/dokumentasjon/dashboard-alpha'
  )
  await expect(table.getByRole('link', { name: 'E100.1 Alpha' })).toHaveAttribute(
    'target',
    '_blank'
  )
  const documentHeader = table.getByRole('columnheader', { name: /Etterlevelsesdokument/ })
  await documentHeader.getByRole('button').click()
  await expect(documentHeader).toHaveAttribute('aria-sort', 'ascending')
  await expect(table.locator('tbody tr').first()).toContainText('Alpha')
  await documentHeader.getByRole('button').click()
  await expect(documentHeader).toHaveAttribute('aria-sort', 'descending')
  await expect(table.locator('tbody tr').first()).toContainText('Beta')
  await documentHeader.getByRole('button').click()
  await expect(documentHeader).toHaveAttribute('aria-sort', 'none')
  await expect(table.locator('tbody tr').first()).toContainText('Alpha')

  await page.getByRole('tab', { name: 'Etterlevelse', exact: true }).click()
  await expect(table.getByRole('columnheader')).toHaveCount(8)
  const kravHeader = table.getByRole('columnheader', { name: 'Antall krav ferdig utfylt' })
  await kravHeader.getByRole('button').click()
  await expect(table.locator('tbody tr').first()).toContainText('Beta')
  await table.getByRole('button', { name: '75%', exact: true }).click()
  await expect(page.getByText('Oppfylt der kravet er ferdig vurdert: 75%')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('tab', { name: 'Digital PVK', exact: true }).click()
  await expect(table.getByRole('columnheader')).toHaveCount(14)
  const scenarioHeader = table.getByRole('columnheader', { name: /Antall risikoscenario/ })
  await expect(scenarioHeader).toContainText('(3)')
  await scenarioHeader.getByRole('button').click()
  await expect(table.locator('tbody tr').first()).toContainText('Beta')
  await expect(table.getByRole('columnheader', { name: /Etterlevelsesdokument/ })).toHaveAttribute(
    'aria-sort',
    'none'
  )

  const scrollWrapper = table.locator('..')
  const dimensions = await scrollWrapper.evaluate((element) => ({
    width: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.width)
})

test('department DataGrid shows empty results inside the table after filtering', async ({
  page,
}) => {
  await page.goto(`http://localhost:3000/dashboard/${avdelingId}?sok=missing-document`)
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table.getByText('Ingen treff på valgte filtre')).toBeVisible()
  await expect(table.getByRole('link')).toHaveCount(0)
})

test('theme document DataGrid preserves numeric sorting, row headers and popovers', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/dashboard/tema/ARKIV?tab=etterlevelsesdokumenter')
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table).toHaveClass(/aksel-data-table/)
  await expect(table.getByRole('columnheader')).toHaveCount(6)
  await expect(table.getByRole('rowheader', { name: 'E100.1 Alpha' })).toBeVisible()
  const oppfyltHeader = table.getByRole('columnheader', { name: 'Oppfylt', exact: true })
  await oppfyltHeader.getByRole('button').click()
  await expect(table.locator('tbody tr').first()).toContainText('Beta')
  await oppfyltHeader.getByRole('button').click()
  await expect(table.locator('tbody tr').first()).toContainText('Alpha')
  await table.getByRole('button', { name: '75%', exact: true }).click()
  await expect(page.getByText('Oppfylt der kravet er ferdig vurdert: 75%')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(table.getByRole('link', { name: 'E200.2 Beta' })).toHaveAttribute('target', '_blank')
})

test('DataGrid keeps its header visible while scrolling a large document list', async ({
  page,
}) => {
  const manyDocuments = Array.from({ length: 40 }, (_, index) => ({
    ...documents[0],
    etterlevelseDokumentasjonId: `dashboard-${index}`,
    etterlevelseNummer: index + 1,
  }))
  await page.route('**/dashboard/table/avdeling/**', (route) =>
    route.fulfill({ json: manyDocuments })
  )
  await page.goto(`http://localhost:3000/dashboard/${avdelingId}`)
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table.locator('tbody tr')).toHaveCount(40)
  await table.getByRole('columnheader').first().scrollIntoViewIfNeeded()
  const scrollWrapper = table.locator('..')
  const dimensions = await scrollWrapper.evaluate((element) => {
    element.scrollTop = 300
    element.scrollLeft = 100
    return {
      height: element.clientHeight,
      scrollHeight: element.scrollHeight,
      viewportHeight: window.innerHeight,
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
    }
  })
  expect(dimensions.height).toBeLessThanOrEqual(dimensions.viewportHeight * 0.8 + 1)
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.height)
  expect(dimensions.scrollTop).toBe(300)
  expect(dimensions.scrollLeft).toBe(100)
  const header = await table.locator('thead').boundingBox()
  const scrollBox = await scrollWrapper.boundingBox()
  expect(header).not.toBeNull()
  expect(scrollBox).not.toBeNull()
  expect(Math.abs(header!.y - scrollBox!.y)).toBeLessThanOrEqual(1)
})

test('department DataGrid hides the unit column when no document has units', async ({ page }) => {
  await page.route('**/dashboard/table/avdeling/**', (route) =>
    route.fulfill({ json: documents.map((dok) => ({ ...dok, enheter: [] })) })
  )
  await page.goto(`http://localhost:3000/dashboard/${avdelingId}`)
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table.getByRole('columnheader')).toHaveCount(9)
  await expect(table.getByRole('columnheader', { name: 'Enhet', exact: true })).toHaveCount(0)
})

test('theme document DataGrid displays an empty state without losing its headers', async ({
  page,
}) => {
  await page.route('**/dashboard/table/tema/**', (route) => route.fulfill({ json: [] }))
  await page.goto('http://localhost:3000/dashboard/tema/ARKIV?tab=etterlevelsesdokumenter')
  const table = page.getByRole('table', { name: 'Etterlevelsesdokumenter' })
  await expect(table.getByRole('columnheader')).toHaveCount(6)
  await expect(table.getByText('Ingen treff på valgte filtre')).toBeVisible()
})

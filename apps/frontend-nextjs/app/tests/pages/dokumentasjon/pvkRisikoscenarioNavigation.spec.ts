import { test as base, expect } from '@playwright/test'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IP360UserPageResponse } from '@/constants/p360/p360Constants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { mockNomOrganisering } from '@/tests/utils/etterlevelsesdokument'
import { mockIdent } from '@/tests/utils/roller'

const dokumentasjonId = 'pvk-navigation-document'
const pvkDokumentId = 'pvk-navigation-pvk'
const baseUrl = `http://localhost:3000/dokumentasjon/${dokumentasjonId}/pvkdokument/${pvkDokumentId}`
const changeStamp = {
  lastModifiedDate: '2026-10-26T10:00:00Z',
  lastModifiedBy: mockIdent,
}
const resource: ITeamResource = {
  navIdent: mockIdent,
  givenName: 'Test',
  familyName: 'Risikoeier',
  fullName: 'Test Risikoeier',
  email: 'test.risikoeier@nav.no',
  resourceType: 'INTERNAL',
}
const dokumentasjon: IEtterlevelseDokumentasjon = {
  id: dokumentasjonId,
  changeStamp,
  version: 1,
  title: 'PVK-navigasjon',
  beskrivelse: 'Dokumentasjon for simulering av PVK-prosessen',
  status: EEtterlevelseDokumentasjonStatus.UNDER_ARBEID,
  etterlevelseNummer: 1,
  etterlevelseDokumentVersjon: 1,
  hasCurrentUserAccess: true,
  behandlerPersonopplysninger: true,
  behandlinger: [],
  behandlingIds: [],
  dpBehandlinger: [],
  dpBehandlingIds: [],
  resources: [mockIdent],
  resourcesData: [resource],
  teams: [],
  teamsData: [],
  risikoeiere: [mockIdent],
  risikoeiereData: [resource],
  nomOrganisering: {
    ...mockNomOrganisering,
    nomAvdelingId: 'avdeling-1',
    avdelingNavn: 'Testavdelingen',
  },
  varslingsadresser: [],
  irrelevansFor: [],
  prioritertKravNummer: [],
  ardoqSystemIds: [],
  ardoqSystemData: [],
  risikovurderinger: [],
  tilgjengeligForGjenbruk: false,
  forGjenbruk: false,
  gjenbrukBeskrivelse: '',
  p360Recno: 0,
  p360CaseNumber: '',
  versjonHistorikk: [{ versjon: 1, kravTilstandHistorikk: [] }],
}
const pvkDokument: IPvkDokument = {
  id: pvkDokumentId,
  changeStamp,
  version: 1,
  etterlevelseDokumentId: dokumentasjonId,
  status: EPvkDokumentStatus.UNDERARBEID,
  pvkVurdering: EPvkVurdering.LEGGE_OVER_EKSISTERENDE,
  pvkVurderingsBegrunnelse: 'Eksisterende PVK skal dokumenteres',
  behandlingensLivslopBeskrivelse: '',
  ytterligereEgenskaper: [],
  harInvolvertRepresentant: false,
  representantInvolveringsBeskrivelse: 'Representanter er ikke involvert i denne simuleringen',
  harDatabehandlerRepresentantInvolvering: false,
  dataBehandlerRepresentantInvolveringBeskrivelse: 'Ingen eksterne databehandlere',
  merknadTilRisikoeier: '',
  merknadFraRisikoeier: '',
  meldingerTilPvo: [],
  antallInnsendingTilPvo: 0,
  godkjentAvRisikoeierDato: '',
  godkjentAvRisikoeier: '',
  currentEtterlevelseDokumentVersjon: 1,
  hasPvkDocumentationStarted: true,
  hasPvkDocumentBeenUpdatedAfterApproval: false,
  dpProcessProfilering: false,
  dpProcessHelautomatiskBehandling: false,
  innsendingTrukket: false,
}
const behandlingensLivslop: IBehandlingensLivslop = {
  id: 'livslop-1',
  changeStamp,
  version: 1,
  etterlevelseDokumentasjonId: dokumentasjonId,
  beskrivelse: 'Personopplysninger samles inn, behandles og slettes',
  filer: [],
}
const artOgOmfang: IBehandlingensArtOgOmfang = {
  id: 'art-og-omfang-1',
  changeStamp,
  version: 1,
  etterlevelseDokumentasjonId: dokumentasjonId,
  stemmerPersonkategorier: true,
  personkategoriAntallBeskrivelse: 'Et begrenset antall registrerte',
  tilgangsBeskrivelsePersonopplysningene: 'Kun autoriserte medarbeidere har tilgang',
  lagringsBeskrivelsePersonopplysningene: 'Opplysningene lagres i et tilgangsstyrt system',
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
const tiltak: ITiltak = {
  id: 'tiltak-1',
  changeStamp,
  version: 1,
  pvkDokumentId,
  navn: 'Begrense tilgang',
  beskrivelse: 'Tilgang gis kun ved tjenstlig behov',
  ansvarlig: resource,
  ansvarligTeam: {
    id: 'team-1',
    name: 'Testteam',
    description: 'Team for simuleringen',
    tags: [],
    members: [{ navIdent: mockIdent, name: resource.fullName }],
  },
  frist: '',
  risikoscenarioIds: alleRisikoscenarioer.map(({ id }) => id),
  iverksatt: true,
  iverksattDato: '2026-10-26',
  iverksettingsKommentar: 'Tilgangsstyring er innført',
}
const emptyPage: IPageResponse<never> = {
  pageNumber: 0,
  pageSize: 20,
  pages: 0,
  numberOfElements: 0,
  totalElements: 0,
  content: [],
}
const p360User: IP360UserPageResponse = {
  Successful: true,
  Users: [{ ContactExternalId: mockIdent, IsActive: true }],
  TotalPageCount: 1,
  TotalCount: 1,
  ErrorMessage: '',
  ErrorDetails: '',
}

const test = base.extend<{ mockIsolation: void }>({
  mockIsolation: [
    async ({ context }, use) => {
      const unmockedRequests: string[] = []
      const pageErrors: string[] = []
      context.on('page', (page) => {
        page.on('pageerror', (error) => pageErrors.push(error.message))
      })
      await context.route('**/*', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        if (request.resourceType() === 'font') {
          await route.abort('blockedbyclient')
          return
        }
        // Only Next.js page assets and navigation may reach the local frontend.
        if (
          url.origin === new URL(baseUrl).origin &&
          !url.pathname.startsWith('/api/') &&
          url.pathname !== '/graphql' &&
          url.pathname !== '/userinfo'
        ) {
          await route.continue()
          return
        }
        unmockedRequests.push(`${request.method()} ${request.url()}`)
        await route.abort('blockedbyclient')
      })
      await use()
      expect(unmockedRequests, 'Alle dataforespørsler skal være mocket').toEqual([])
      expect(pageErrors, 'Simuleringen skal ikke ha ubehandlede JavaScript-feil').toEqual([])
    },
    { auto: true },
  ],
})

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
  await context.route('**/api/melding/type/SYSTEM', (route) => route.fulfill({ json: emptyPage }))
  await context.route('**/api/p360/user', (route) => route.fulfill({ json: p360User }))
  await context.route('**/graphql', (route) => {
    expect(route.request().postDataJSON().operationName).toBe('getKravByFilter')
    return route.fulfill({ json: { data: { krav: emptyPage } } })
  })
  await context.route(`**/api/etterlevelsedokumentasjon/${dokumentasjonId}`, (route) =>
    route.fulfill({ json: dokumentasjon })
  )
  await context.route(`**/api/pvkdokument/${pvkDokumentId}`, (route) =>
    route.fulfill({ json: pvkDokument })
  )
  await context.route(`**/api/pvkdokument/etterlevelsedokument/${dokumentasjonId}`, (route) =>
    route.fulfill({ json: pvkDokument })
  )
  await context.route(
    `**/api/behandlingens-art-og-omfang/etterlevelsedokument/${dokumentasjonId}`,
    (route) => route.fulfill({ json: artOgOmfang })
  )
  await context.route(
    `**/api/behandlingenslivslop/etterlevelsedokument/${dokumentasjonId}`,
    (route) => route.fulfill({ json: behandlingensLivslop })
  )
  await context.route(`**/api/risikoscenario/pvkdokument/${pvkDokumentId}/ALL`, (route) =>
    route.fulfill({
      json: {
        ...emptyPage,
        pages: 1,
        content: alleRisikoscenarioer,
        numberOfElements: alleRisikoscenarioer.length,
        totalElements: alleRisikoscenarioer.length,
      },
    })
  )
  await context.route(`**/api/tiltak/pvkdokument/${pvkDokumentId}`, (route) =>
    route.fulfill({
      json: {
        ...emptyPage,
        pages: 1,
        content: [tiltak],
        numberOfElements: 1,
        totalElements: 1,
      },
    })
  )
})

const stepHeadings = [
  'Oversikt over PVK-prosessen',
  'Behandlingens livsløp',
  'Behandlingens art og omfang',
  'Tilhørende dokumentasjon',
  'Involvering av eksterne deltakere',
  'Identifisering av risikoscenarioer og tiltak',
  'Risikobildet etter tiltak',
  'Les og send inn',
]

for (const [index, heading] of stepHeadings.entries()) {
  test(`simulerer PVK-steg ${index + 1} med mocket data`, async ({ page }) => {
    await page.goto(`${baseUrl}?steg=${index + 1}`)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  })
}

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
  await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
  const sendButton = page.getByRole('button', { name: 'Lagre og send til risikoeier' })
  await sendButton.click()

  const errorSummary = page.getByRole('heading', {
    name: EEtterlevelseDokumentFormConstants.ERROR_SUMMARY_HEADING,
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

test('steg 6 åpner og fokuserer risikoscenarioet fra lenken', async ({ page }) => {
  await page.goto(`${baseUrl}?steg=6&risikoscenario=risiko-2`)

  const selectedHeader = page.getByRole('button', { name: 'Andre risiko', exact: false })
  await expect(selectedHeader).toHaveAttribute('aria-expanded', 'true')
  await expect(selectedHeader).toBeFocused()
  await expect(selectedHeader).toBeInViewport()
})

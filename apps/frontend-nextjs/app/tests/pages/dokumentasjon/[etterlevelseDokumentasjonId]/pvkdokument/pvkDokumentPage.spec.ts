import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
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
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { mockNomOrganisering } from '@/tests/utils/etterlevelsesdokument'
import { test as base, expect, frontendUrl } from '@/tests/utils/fixtures'
import { IPvkMockData, createPvkMockData, mockPvkApi } from '@/tests/utils/pvkDokument'
import {
  mockAdmin,
  mockIdent,
  mockKraveier,
  mockPersonvernombud,
  mockRead,
  mockWrite,
} from '@/tests/utils/roller'

const roleScenarios = [
  {
    name: 'admin',
    mockUser: mockAdmin,
    hasDocumentAccess: false,
    canView: true,
    canEdit: true,
  },
  {
    name: 'kraveier',
    mockUser: mockKraveier,
    hasDocumentAccess: false,
    canView: false,
    canEdit: false,
  },
  {
    name: 'lesebruker',
    mockUser: mockRead,
    hasDocumentAccess: false,
    canView: false,
    canEdit: false,
  },
  {
    name: 'skrivebruker',
    mockUser: mockWrite,
    hasDocumentAccess: true,
    canView: true,
    canEdit: true,
  },
  {
    name: 'personvernombud',
    mockUser: mockPersonvernombud,
    hasDocumentAccess: false,
    canView: true,
    canEdit: false,
  },
]

const dokumentasjonId = 'pvk-navigation-document'
const pvkDokumentId = 'pvk-navigation-pvk'
const baseUrl = `${frontendUrl}/dokumentasjon/${dokumentasjonId}/pvkdokument/${pvkDokumentId}`
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
const otherResource: ITeamResource = {
  ...resource,
  navIdent: 'R123456',
  givenName: 'Annen',
  fullName: 'Annen Risikoeier',
  email: 'annen.risikoeier@nav.no',
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
const setDocumentAccess = (data: IPvkMockData, hasAccess: boolean) => {
  const member = hasAccess ? resource : otherResource
  data.dokumentasjon.hasCurrentUserAccess = hasAccess
  data.dokumentasjon.resources = [member.navIdent]
  data.dokumentasjon.resourcesData = [member]
  data.dokumentasjon.teamsData?.forEach((team) => {
    team.members = [{ navIdent: member.navIdent, name: member.fullName }]
  })
  data.historikk.dokumentasjon = structuredClone(data.dokumentasjon)
}

const test = base.extend<{
  role: (typeof roleScenarios)[number]
  isRiskOwner: boolean
  mockIsolation: void
  mockData: IPvkMockData
}>({
  role: [roleScenarios[0], { option: true }],
  isRiskOwner: [false, { option: true }],
  mockData: async ({ context, role, isRiskOwner }, provide) => {
    const data = createPvkMockData(
      {
        dokumentasjon,
        pvkDokument,
        behandlingensLivslop,
        artOgOmfang,
        risikoscenarioer: alleRisikoscenarioer,
        tiltak: [tiltak],
      },
      resource
    )
    const riskOwner = isRiskOwner ? resource : otherResource
    data.dokumentasjon.risikoeiere = [riskOwner.navIdent]
    data.dokumentasjon.risikoeiereData = [riskOwner]
    setDocumentAccess(data, role.hasDocumentAccess)
    await mockPvkApi(context, data)
    await provide(data)
  },
  mockIsolation: [
    async ({ context }, use) => {
      const pageErrors: string[] = []
      const cacheWarnings: string[] = []
      context.on('page', (page) => {
        page.on('console', (message) => {
          const text = message.text()
          if (
            (message.type() === 'error' && /Missing field/.test(text)) ||
            (text.includes('getKravByFilter') && text.includes('partial result'))
          ) {
            cacheWarnings.push(text)
          }
        })
        page.on('pageerror', (error) => {
          if (error.message === 'ResizeObserver loop completed with undelivered notifications.') {
            console.warn(`Browser layout warning: ${error.message}`)
            return
          }
          pageErrors.push(error.message)
        })
      })
      await use()
      expect(pageErrors, 'Simuleringen skal ikke ha ubehandlede JavaScript-feil').toEqual([])
      expect(cacheWarnings, 'Kravresponsen skal kunne leses fullstendig fra Apollo-cache').toEqual(
        []
      )
    },
    { auto: true },
  ],
})

test.beforeEach(async ({ context, mockData, role }) => {
  expect(mockData.dokumentasjon.id).toBe(dokumentasjonId)
  await role.mockUser(context)
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

for (const role of roleScenarios) {
  test.describe(`Som ${role.name} skal jeg`, () => {
    test.use({ role })

    for (const [index, heading] of stepHeadings.entries()) {
      test(`${role.canView ? 'se' : 'nektes tilgang til'} PVK-steg ${index + 1} med mocket data`, async ({
        page,
      }) => {
        await page.goto(`${baseUrl}?steg=${index + 1}`, { waitUntil: 'domcontentloaded' })
        if (!role.canView) {
          await expect(
            page.getByText('Du har ikke tilgang til å redigere på PVK dokument.', { exact: true })
          ).toBeVisible()
          await expect(page.getByRole('heading', { name: heading, exact: true })).toHaveCount(0)
          await expect(page.getByRole('button', { name: 'Lagre', exact: true })).toHaveCount(0)
          return
        }
        await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
        if (index === 1) {
          await expect(page.locator('input[type="file"]')).toHaveCount(role.canEdit ? 1 : 0)
          if (!role.canEdit) {
            await expect(
              page.getByText(behandlingensLivslop.beskrivelse, { exact: true })
            ).toBeVisible()
          }
        }
        if (index === 2) {
          await expect(page.getByText('Brukere', { exact: true })).toBeVisible()
          await expect(
            page.getByRole('textbox', { name: /2\. For hver av personkategoriene/ })
          ).toHaveCount(role.canEdit ? 1 : 0)
        }
        if (index === 3) {
          await expect(
            page.getByText('1 av 1 krav er ferdig utfylt.', { exact: true })
          ).toBeVisible()
        }
        if (index === 4) {
          await expect(page.getByText('Testdatabehandler', { exact: true })).toBeVisible()
        }
        if ([1, 2, 4].includes(index)) {
          await expect(page.getByRole('button', { name: 'Lagre', exact: true })).toHaveCount(
            role.canEdit ? 1 : 0
          )
        }
        if (index === 5) {
          await expect(
            page.getByRole('button', { name: 'Legg til ikke krav-spesifikt risikoscenario' })
          ).toHaveCount(role.canEdit ? 1 : 0)
        }
        if (index === 7) {
          await expect(
            page.getByRole('button', { name: 'Lagre og send til risikoeier', exact: true })
          ).toHaveCount(role.canEdit ? 1 : 0)
        }
      })
    }

    if (role.hasDocumentAccess) {
      test('nektes tilgang når jeg ikke er dokumentmedlem eller risikoeier', async ({
        page,
        mockData,
      }) => {
        setDocumentAccess(mockData, false)
        await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
        await expect(
          page.getByText('Du har ikke tilgang til å redigere på PVK dokument.', { exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole('heading', { name: 'Les og send inn', exact: true })
        ).toHaveCount(0)
      })
    }

    test('ikke få godkjenningshandlingen uten å være registrert som risikoeier', async ({
      page,
      mockData,
    }) => {
      mockData.pvkDokument.status = EPvkDokumentStatus.TRENGER_GODKJENNING
      await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
      if (role.canView) {
        await expect(
          page.getByRole('heading', { name: 'Sendt oppdatert PVK', exact: true })
        ).toBeVisible()
      } else {
        await expect(
          page.getByText('Du har ikke tilgang til å redigere på PVK dokument.', { exact: true })
        ).toBeVisible()
      }
      const approve = page.getByRole('button', {
        name: 'Aksepter restrisiko og arkiver i Public 360',
        exact: true,
      })
      await expect(approve).toHaveCount(0)
    })

    test.describe('med risikoeieransvar', () => {
      test.use({ isRiskOwner: true })

      test('få tilgang til godkjenning av mitt PVK-dokument', async ({ page, mockData }) => {
        mockData.pvkDokument.status = EPvkDokumentStatus.TRENGER_GODKJENNING
        await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
        await expect(
          page.getByRole('button', {
            name: 'Aksepter restrisiko og arkiver i Public 360',
            exact: true,
          })
        ).toBeVisible()
      })
    })

    if (role.name === 'admin') {
      test('åpner og fokuserer risikoscenarioet fra lenken etter at data er lastet', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1280, height: 400 })
        await page.goto(
          `${baseUrl}?steg=7&tab=risikoscenarioer&filter=ikke-vurdert&risikoscenario=risiko-2`,
          { waitUntil: 'domcontentloaded' }
        )

        const selectedHeader = page.getByRole('button', { name: 'Andre risiko', exact: false })
        await expect(selectedHeader).toHaveAttribute('aria-expanded', 'true')
        await expect(selectedHeader).toBeFocused()
        await expect(selectedHeader).toBeInViewport()
        await page.waitForTimeout(1000)
        await expect(selectedHeader).toBeInViewport()
        const headerTop = await selectedHeader.evaluate((el) => el.getBoundingClientRect().top)
        expect(headerTop).toBeLessThan(200)
        await expect(
          page.getByRole('button', { name: 'Første risiko', exact: false })
        ).toHaveAttribute('aria-expanded', 'false')

        await selectedHeader.click()
        await expect(selectedHeader).toHaveAttribute('aria-expanded', 'false')
        await expect(page).not.toHaveURL(/risikoscenario=/)

        await page.getByRole('button', { name: 'Første risiko', exact: false }).click()
        await expect(
          page.getByRole('button', { name: 'Første risiko', exact: false })
        ).toBeFocused()
        await expect(page).toHaveURL(/risikoscenario=risiko-1/)
      })

      test('lar risikoscenarioene være lukket når lenken bare har et filter', async ({ page }) => {
        await page.goto(`${baseUrl}?steg=7&tab=risikoscenarioer&filter=ikke-vurdert`, {
          waitUntil: 'domcontentloaded',
        })

        for (const risiko of risikoscenarioer) {
          await expect(
            page.getByRole('button', { name: risiko.navn, exact: false })
          ).toHaveAttribute('aria-expanded', 'false')
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

      test('steg 6 åpner og fokuserer risikoscenarioet når data lastes sent', async ({ page }) => {
        await page.route(
          `**/api/risikoscenario/pvkdokument/${pvkDokumentId}/ALL`,
          async (route) => {
            // Keep the response pending beyond the original 200 ms focus timeout.
            await new Promise((resolve) => setTimeout(resolve, 750))
            await route.fulfill({
              json: {
                pageNumber: 0,
                pageSize: 20,
                pages: 1,
                content: alleRisikoscenarioer,
                numberOfElements: alleRisikoscenarioer.length,
                totalElements: alleRisikoscenarioer.length,
              },
            })
          }
        )
        await page.goto(`${baseUrl}?steg=6&risikoscenario=risiko-2`, {
          waitUntil: 'domcontentloaded',
        })

        const selectedHeader = page.getByRole('button', { name: 'Andre risiko', exact: false })
        await expect(selectedHeader).toHaveAttribute('aria-expanded', 'true')
        await expect(selectedHeader).toBeFocused()
        await expect(selectedHeader).toBeInViewport()
      })

      for (const status of Object.values(EPvkDokumentStatus).filter(
        (status) => status !== EPvkDokumentStatus.UNDERARBEID
      )) {
        test(`simulerer innsending med status ${status} og PVO-data`, async ({
          page,
          mockData,
        }) => {
          mockData.pvkDokument.status = status
          mockData.pvkDokument.antallInnsendingTilPvo = 2
          mockData.pvkDokument.meldingerTilPvo = [1, 2].map((innsendingId) => ({
            innsendingId,
            etterlevelseDokumentVersjon: 1,
            merknadTilPvo: `Merknad fra innsending ${innsendingId}`,
            endringsNotat: 'Oppdatert dokumentasjon',
            sendtTilPvoDato: '2026-10-24T10:00:00Z',
            sendtTilPvoAv: mockIdent,
          }))
          if (status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) {
            mockData.pvkDokument.godkjentAvRisikoeierDato = changeStamp.lastModifiedDate
            mockData.pvkDokument.godkjentAvRisikoeier = resource.fullName
          }

          const feedback = page.waitForResponse(
            `**/api/pvotilbakemelding/pvkdokument/${pvkDokumentId}`
          )
          await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
          expect((await feedback).ok()).toBe(true)
          await expect(
            page.getByRole('heading', { name: 'Les og send inn', exact: true })
          ).toBeVisible()
          if (
            [
              EPvkDokumentStatus.SENDT_TIL_PVO,
              EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
              EPvkDokumentStatus.PVO_UNDERARBEID,
            ].includes(status)
          ) {
            await expect(page.getByText('Merknad fra innsending 2', { exact: true })).toBeVisible()
          } else {
            await expect(
              page.getByRole('heading', { name: 'Versjonshistorikk', exact: true })
            ).toBeVisible()
          }
        })
      }

      for (const step of [4, 5]) {
        test(`simulerer historiske data i steg ${step}`, async ({ page, mockData }) => {
          mockData.pvkDokument.status = EPvkDokumentStatus.TRENGER_GODKJENNING
          mockData.pvkDokument.godkjentAvRisikoeierDato = changeStamp.lastModifiedDate
          const tableId = step === 4 ? dokumentasjonId : pvkDokumentId
          const history = page.waitForResponse(`**/api/audit/log/${tableId}/**`)
          await page.goto(`${baseUrl}?steg=${step}`, { waitUntil: 'domcontentloaded' })
          expect((await history).ok()).toBe(true)
          await expect(
            page.getByRole('heading', { name: stepHeadings[step - 1], exact: true })
          ).toBeVisible()
        })
      }
    }

    if (role.canView) {
      test('viser PVOs nåværende og tidligere tilbakemelding', async ({ page, mockData }) => {
        mockData.pvkDokument.status = EPvkDokumentStatus.VURDERT_AV_PVO
        mockData.pvkDokument.antallInnsendingTilPvo = 2
        await page.goto(`${baseUrl}?steg=2`, { waitUntil: 'domcontentloaded' })
        await expect(
          page.getByText('PVO-tilbakemelding fra innsending 2', { exact: true })
        ).toBeVisible()
        await page.getByRole('button', { name: /1\. tilbakemelding/ }).click()
        await expect(
          page.getByText('PVO-tilbakemelding fra innsending 1', { exact: true })
        ).toBeVisible()
      })
    }

    if (role.canEdit) {
      test('lagrer art og omfang i mockdata og beholder endringen etter omlasting', async ({
        page,
      }) => {
        await page.goto(`${baseUrl}?steg=3`, { waitUntil: 'domcontentloaded' })
        const field = page.getByRole('textbox', { name: /2\. For hver av personkategoriene/ })
        await field.fill('Omtrent 100 registrerte i simuleringen')
        const saved = page.waitForResponse(
          (response) =>
            response.url().endsWith('/api/behandlingens-art-og-omfang/art-og-omfang-1') &&
            response.request().method() === 'PUT'
        )
        await page.getByRole('button', { name: 'Lagre', exact: true }).click()
        expect((await saved).ok()).toBe(true)
        await expect(page.getByText('Lagring vellykket', { exact: true }).first()).toBeVisible()
        await page.reload({
          waitUntil: 'domcontentloaded',
        })
        await expect(field).toHaveValue('Omtrent 100 registrerte i simuleringen')
      })

      test('lagrer livsløp med vedlegg som multipart mockdata', async ({ page, mockData }) => {
        const buffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
          'base64'
        )
        await page.goto(`${baseUrl}?steg=2`, { waitUntil: 'domcontentloaded' })
        await page.locator('input[type="file"]').setInputFiles({
          name: 'livslop.png',
          mimeType: 'image/png',
          buffer,
        })
        const saved = page.waitForResponse(
          (response) =>
            response.url().endsWith('/api/behandlingenslivslop/livslop-1') &&
            response.request().method() === 'PUT'
        )
        await page.getByRole('button', { name: 'Lagre', exact: true }).click()
        expect((await saved).ok()).toBe(true)
        await expect(page.getByText('Lagring vellykket', { exact: true }).first()).toBeVisible()
        expect(mockData.behandlingensLivslop.filer).toHaveLength(1)
        expect(mockData.behandlingensLivslop.filer[0].filnavn).toBe('livslop.png')
        expect(mockData.behandlingensLivslop.filer[0].filtype).toBe('image/png')
        expect(mockData.behandlingensLivslop.filer[0].fil).toBe(buffer.toString('base64'))
        await page.reload({
          waitUntil: 'domcontentloaded',
        })
        await expect(page.getByText('livslop.png', { exact: true }).first()).toBeVisible()
      })

      test('oppretter, oppdaterer og sletter et risikoscenario i mockdata', async ({
        page,
        mockData,
      }) => {
        await page.goto(`${baseUrl}?steg=6`, { waitUntil: 'domcontentloaded' })
        await page
          .getByRole('button', { name: 'Legg til ikke krav-spesifikt risikoscenario' })
          .click()
        const dialog = page.getByRole('dialog', { name: 'Opprett nytt risikoscenario' })
        await dialog
          .getByRole('textbox', { name: 'Navngi risikoscenarioet' })
          .fill('Ny simulert risiko')
        await dialog.getByRole('textbox', { name: 'Beskriv risikoscenarioet' }).fill('Beskrivelse')
        await dialog.getByRole('button', { name: 'Lagre risikoscenario', exact: true }).click()
        const header = page.getByRole('button', { name: 'Ny simulert risiko', exact: false })
        await expect(header).toHaveAttribute('aria-expanded', 'true')
        await expect(dialog).toHaveCount(0)
        await expect(header).toBeFocused()
        const created = mockData.risikoscenarioer.find(({ navn }) => navn === 'Ny simulert risiko')
        expect(created).toMatchObject({
          pvkDokumentId,
          beskrivelse: 'Beskrivelse',
          generelScenario: true,
          tiltakIds: [],
          relevanteKravNummer: [],
        })
        await page.reload({
          waitUntil: 'domcontentloaded',
        })
        await expect(header).toHaveAttribute('aria-expanded', 'true')
        await expect(header).toBeFocused()
        await page.getByRole('button', { name: 'Rediger risikoscenario', exact: true }).click()
        const editDialog = page.getByRole('dialog', { name: 'Rediger risikoscenario', exact: true })
        await editDialog
          .getByRole('textbox', { name: 'Beskriv risikoscenarioet' })
          .fill('Oppdatert beskrivelse')
        await editDialog.getByRole('button', { name: 'Lagre risikoscenario', exact: true }).click()
        await expect(editDialog).toHaveCount(0)
        expect(
          mockData.risikoscenarioer.find(({ navn }) => navn === 'Ny simulert risiko')?.beskrivelse
        ).toBe('Oppdatert beskrivelse')
        await page.reload({ waitUntil: 'domcontentloaded' })
        await expect(header).toHaveAttribute('aria-expanded', 'true')
        await expect(header).toBeFocused()
        await expect(page.getByText('Oppdatert beskrivelse', { exact: true })).toBeVisible()
        await page.getByRole('button', { name: 'Slett risikoscenario', exact: true }).click()
        await page
          .getByRole('dialog', { name: 'Vil dere slette dette risikoscenarioet?' })
          .getByRole('button', { name: 'Slett risikoscenario', exact: true })
          .click()
        await expect(header).toHaveCount(0)
        expect(mockData.risikoscenarioer.some(({ navn }) => navn === 'Ny simulert risiko')).toBe(
          false
        )
        await expect(page).toHaveURL(`${baseUrl}?steg=6`)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await expect(
          page.getByRole('heading', { name: stepHeadings[5], exact: true })
        ).toBeVisible()
        await expect(header).toHaveCount(0)
      })

      test('oppretter, oppdaterer og sletter tiltak med mocket tiltaksansvarlig', async ({
        page,
        mockData,
      }) => {
        const responsible = role.hasDocumentAccess ? resource : otherResource
        await page.goto(`${baseUrl}?steg=6&risikoscenario=risiko-2`, {
          waitUntil: 'domcontentloaded',
        })
        await expect(page.getByRole('button', { name: 'Andre risiko', exact: true })).toBeFocused()
        await page.getByRole('button', { name: 'Opprett nytt tiltak', exact: true }).click()
        await page.getByRole('textbox', { name: 'Navngi tiltaket' }).fill('Nytt simulert tiltak')
        await page
          .getByRole('textbox', { name: 'Beskriv tiltaket nærmere' })
          .fill('Begrens datatilgang')
        await page
          .getByRole('combobox', { name: 'Søk etter person', exact: true })
          .fill(responsible.givenName)
        await page.getByRole('option', { name: responsible.fullName }).click()
        await page.getByRole('checkbox', { name: 'Marker tiltaket som iverksatt' }).check()
        await page.getByRole('button', { name: 'Lagre tiltak', exact: true }).click()
        const createdHeader = page.getByRole('button', {
          name: 'Nytt simulert tiltak',
          exact: false,
        })
        await expect(createdHeader).toBeVisible()
        await expect(createdHeader).toBeFocused()
        const created = mockData.tiltak.find(({ navn }) => navn === 'Nytt simulert tiltak')
        expect(created?.ansvarlig.navIdent).toBe(responsible.navIdent)
        expect(created?.risikoscenarioIds).toEqual(['risiko-2'])
        await page.getByRole('button', { name: 'Rediger tiltak', exact: true }).click()
        await page
          .getByRole('textbox', { name: 'Navngi tiltaket' })
          .fill('Oppdatert simulert tiltak')
        await page.getByRole('button', { name: 'Lagre tiltak', exact: true }).click()
        const updatedHeader = page.getByRole('button', {
          name: 'Oppdatert simulert tiltak',
          exact: false,
        })
        await expect(updatedHeader).toBeVisible()
        await page.route(`**/api/tiltak/pvkdokument/${pvkDokumentId}`, async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          await route.fallback()
        })
        await page.reload({
          waitUntil: 'domcontentloaded',
        })
        await expect(updatedHeader).toBeVisible()
        await expect(updatedHeader).toBeFocused()
        await page.getByRole('button', { name: 'Slett tiltak', exact: true }).click()
        const deleteDialog = page.getByRole('dialog', {
          name: 'Vil dere slette dette tiltaket?',
        })
        await expect(deleteDialog).toBeVisible()
        const deleted = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === `/api/tiltak/${created?.id}` &&
            response.request().method() === 'DELETE'
        )
        await deleteDialog.getByRole('button', { name: 'Slett', exact: true }).click()
        expect((await deleted).ok()).toBe(true)
        await expect(updatedHeader).toHaveCount(0)
        expect(mockData.tiltak.some(({ id }) => id === created?.id)).toBe(false)
      })

      test('fokuserer risikoscenarioet når tiltaket i lenken ikke finnes', async ({ page }) => {
        await page.route(`**/api/tiltak/pvkdokument/${pvkDokumentId}`, async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          await route.fallback()
        })
        await page.goto(`${baseUrl}?steg=6&risikoscenario=risiko-2&tiltak=slettet-tiltak`, {
          waitUntil: 'domcontentloaded',
        })
        await expect(page.getByRole('button', { name: 'Andre risiko', exact: true })).toBeFocused()
      })

      test('sender fullstendig PVK til PVO med kun mockdata', async ({ page, mockData }) => {
        const waitForSave = () =>
          page.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === `/api/pvkdokument/${pvkDokumentId}` &&
              response.request().method() === 'PUT'
          )
        mockData.risikoscenarioer.forEach((risiko) => {
          risiko.sannsynlighetsNivaaEtterTiltak = 1
          risiko.konsekvensNivaaEtterTiltak = 1
          risiko.nivaaBegrunnelseEtterTiltak = 'Tiltaket reduserer risikoen'
        })
        mockData.pvkDokument.berOmNyVurderingFraPvo = true
        await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
        await expect(
          page.getByText('Et begrenset antall registrerte', { exact: true })
        ).toBeVisible()
        await expect(page.getByText(/Det er vurdert totalt sett 8 risikoscenarioer/)).toBeVisible()
        await expect(page.locator('.aksel-loader:visible')).toHaveCount(0)
        const sent = waitForSave()
        await page
          .getByRole('button', { name: 'Lagre og send til Personvernombudet', exact: true })
          .click()
        const sentResponse = await sent
        expect(sentResponse.ok()).toBe(true)
        expect(await sentResponse.json()).toMatchObject({
          status: EPvkDokumentStatus.SENDT_TIL_PVO,
          antallInnsendingTilPvo: 1,
          innsendingTrukket: false,
          berOmNyVurderingFraPvo: true,
        })
        await expect(
          page.getByRole('button', { name: 'Trekk innsending', exact: true })
        ).toBeVisible()
        expect(mockData.pvkDokument.status).toBe(EPvkDokumentStatus.SENDT_TIL_PVO)
        expect(mockData.pvkDokument.meldingerTilPvo[0].sendtTilPvoAv).toContain(mockIdent)
        await expect(page.locator('.aksel-loader:visible')).toHaveCount(0)
        const withdrawn = waitForSave()
        await page.getByRole('button', { name: 'Trekk innsending', exact: true }).click()
        const withdrawnResponse = await withdrawn
        expect(withdrawnResponse.ok()).toBe(true)
        expect(await withdrawnResponse.json()).toMatchObject({
          status: EPvkDokumentStatus.UNDERARBEID,
          antallInnsendingTilPvo: 0,
          innsendingTrukket: true,
          berOmNyVurderingFraPvo: true,
        })
        await expect(
          page.getByRole('button', { name: 'Lagre og send til Personvernombudet', exact: true })
        ).toBeVisible()
        expect(mockData.pvkDokument.status).toBe(EPvkDokumentStatus.UNDERARBEID)
        expect(mockData.pvkDokument.innsendingTrukket).toBe(true)
        await expect(page.locator('.aksel-loader:visible')).toHaveCount(0)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await expect(
          page.getByRole('button', { name: 'Lagre og send til Personvernombudet', exact: true })
        ).toBeVisible()
        await expect(page.getByText('Innsending trukket', { exact: true })).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Trekk innsending', exact: true })
        ).toHaveCount(0)
        await expect(page.locator('.aksel-loader:visible')).toHaveCount(0)
      })
    }

    if (role.name === 'admin') {
      test('sender til risikoeier og godkjenner med arkivering uten backend', async ({
        page,
        mockData,
      }) => {
        mockData.risikoscenarioer = mockData.risikoscenarioer.map((risiko) => ({
          ...risiko,
          sannsynlighetsNivaaEtterTiltak: 1,
          konsekvensNivaaEtterTiltak: 1,
          nivaaBegrunnelseEtterTiltak: 'Tiltaket reduserer risikoen',
        }))
        mockData.pvkDokument.merknadTilRisikoeier = 'Dokumentasjonen er klar for godkjenning'
        mockData.dokumentasjon.risikoeiere = [mockIdent]
        mockData.dokumentasjon.risikoeiereData = [resource]
        await page.goto(`${baseUrl}?steg=8`, { waitUntil: 'domcontentloaded' })
        await page
          .getByRole('button', { name: 'Lagre og send til risikoeier', exact: true })
          .click()
        const approve = page.getByRole('button', {
          name: 'Aksepter restrisiko og arkiver i Public 360',
        })
        await expect(approve).toBeVisible()
        expect(mockData.pvkDokument.status).toBe(EPvkDokumentStatus.TRENGER_GODKJENNING)
        const archived = page.waitForResponse(`**/api/pvkdokument/godkjenning/${pvkDokumentId}`)
        await approve.click()
        expect((await archived).ok()).toBe(true)
        await expect(approve).toHaveCount(0)
        expect(mockData.pvkDokument.status).toBe(EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
        expect(mockData.historikk.pvkDokument.godkjentAvRisikoeier).toContain(mockIdent)
      })
    }
  })
}

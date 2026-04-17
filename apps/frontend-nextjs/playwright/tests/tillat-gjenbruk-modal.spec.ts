import { expect, test } from '@playwright/test'

const endpointPath = '/api/etterlevelsedokumentasjon/e2e-tillat-gjenbruk'

const apiDokumentasjonResponse = {
  id: 'e2e-tillat-gjenbruk',
  changeStamp: { lastModifiedDate: '', lastModifiedBy: '' },
  version: 1,
  title: '',
  beskrivelse: '',
  status: 'UNDER_ARBEID',
  meldingEtterlevelerTilRisikoeier: '',
  meldingRisikoeierTilEtterleveler: '',
  tilgjengeligForGjenbruk: false,
  gjenbrukBeskrivelse: '',
  behandlingIds: [],
  dpBehandlingIds: [],
  irrelevansFor: [],
  prioritertKravNummer: [],
  etterlevelseNummer: 0,
  teams: [],
  resources: [],
  risikoeiere: [],
  nomAvdelingId: '',
  avdelingNavn: '',
  seksjoner: [],
  teamsData: [],
  resourcesData: [],
  risikoeiereData: [],
  behandlinger: [],
  dpBehandlinger: [],
  behandlerPersonopplysninger: true,
  forGjenbruk: false,
  varslingsadresser: [],
  hasCurrentUserAccess: true,
  risikovurderinger: [],
  p360Recno: 0,
  p360CaseNumber: '',
  etterlevelseDokumentVersjon: 1,
  versjonHistorikk: [],
}

test.describe('TillatGjenbrukModal', () => {
  test('disables Slå på gjenbruk when required fields are missing', async ({ page }) => {
    await page.goto('/e2e/tillat-gjenbruk')

    await expect(
      page.getByRole('heading', { name: 'Slå på gjenbruk av dette dokumentet' })
    ).toBeVisible({ timeout: 30_000 })

    await expect(
      page.getByText(
        'Dere må oppdatere følgende felt i dokumentegenskaper før dere kan slå på gjenbruk.'
      )
    ).toBeVisible({ timeout: 30_000 })

    await expect(page.getByRole('button', { name: 'Slå på gjenbruk' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Lagre til senere' })).toBeEnabled()
  })

  test('allows Lagre til senere without enabling gjenbruk when form has errors', async ({
    page,
  }) => {
    let putBody: Record<string, unknown> | undefined

    await page.route(`**${endpointPath}`, async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiDokumentasjonResponse),
        })
        return
      }

      if (request.method() === 'PUT') {
        putBody = request.postDataJSON() as Record<string, unknown>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...apiDokumentasjonResponse, ...putBody }),
        })
        return
      }

      await route.continue()
    })

    await page.goto('/e2e/tillat-gjenbruk')

    await expect(page.getByRole('button', { name: 'Slå på gjenbruk' })).toBeDisabled({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Lagre til senere' }).click()

    await expect.poll(() => putBody).not.toBeUndefined()
    await expect(page.getByRole('button', { name: 'Slå på gjenbruk' })).toBeDisabled()
    await expect(putBody?.tilgjengeligForGjenbruk).toBe(false)
  })
})

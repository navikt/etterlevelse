import test, { expect } from '@playwright/test'
import { mockAdmin, mockIdent } from '@/tests/utils/roller'

const createdDocument = {
  id: 'created-document-id',
  title: 'Test av nytt etterlevelsesdokument',
  description: 'Dokumentasjon opprettet fra Playwright-testen',
  departmentId: 'avdeling-1',
  departmentName: 'Testavdelingen',
  email: 'bat.man@nav.no',
  sectionName: 'Testseksjonen',
  unitName: 'Testenheten',
  riskOwnerName: 'Test Risikoeier',
  teamName: 'Testteamet',
  treatmentName: 'B101 Testformål: Testbehandling',
  dataProcessorTreatmentName: 'D202: Databehandlerbehandling',
  systemName: 'Testsystemet',
  riskAssessment: 'ROS-analyse for testdokumentet',
  p360CaseNumber: 'SAK-12345',
  reuseDescription: 'Veiledning for gjenbruk av testdokumentet',
}

test.describe('Som en admin bruker skal jeg kunne', () => {
  test('trykke «Opprett nytt etterlevelsesdokument» på forsiden og deretter bli navigert til «Opprett nytt etterlevelsesdokument» siden', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

    await context.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName === 'getEtterlevelseDokumentasjoner') {
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
        return
      }

      await route.continue()
    })

    await page.goto('http://localhost:3000/')

    await expect(page).toHaveTitle(/Etterlevelse/)
    await expect(page.getByRole('button', { name: 'Nytt etterlevelsesdokument' })).toBeVisible()
    await page.getByRole('button', { name: 'Nytt etterlevelsesdokument' }).click()

    await expect(
      page.getByRole('heading', { name: 'Opprett nytt etterlevelsesdokument' })
    ).toBeVisible()
  })

  test('fylle ut miniumskriteriene for «Opprett nytt etterlevelsesdokument» skjemaet og deretter opprette det', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

    await context.route('**/api/codelist?refresh=false', async (route) => {
      await route.fulfill({
        json: {
          codelist: {
            RELEVANS: [
              {
                list: 'RELEVANS',
                code: 'BEHANDLER_PERSONOPPLYSNINGER',
                shortName: 'Behandler personopplysninger',
                description: 'Etterlevelsen behandler personopplysninger',
              },
            ],
          },
        },
      })
    })
    await context.route('**/api/team?myTeams=true', async (route) => {
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
    await context.route('**/nom/avdelinger', async (route) => {
      await route.fulfill({
        json: [{ id: createdDocument.departmentId, navn: createdDocument.departmentName }],
      })
    })
    await context.route(
      `**/nom/seksjon/avdeling/${createdDocument.departmentId}`,
      async (route) => {
        await route.fulfill({ json: [] })
      }
    )
    await context.route('**/etterlevelsedokumentasjon', async (route) => {
      expect(route.request().method()).toBe('POST')
      expect(route.request().postDataJSON()).toMatchObject({
        title: createdDocument.title,
        beskrivelse: createdDocument.description,
        nomAvdelingId: createdDocument.departmentId,
        avdelingNavn: createdDocument.departmentName,
        resources: [mockIdent],
        varslingsadresser: [{ type: 'EPOST', adresse: createdDocument.email }],
      })
      await route.fulfill({ json: { id: createdDocument.id } })
    })

    await page.goto('http://localhost:3000/dokumentasjon/create')

    const titleField = page.getByLabel('Navngi det nye dokumentet ditt')
    const relevanceCheckbox = page.getByRole('checkbox', {
      name: 'Behandler personopplysninger',
    })

    await expect(relevanceCheckbox).toBeVisible()
    await relevanceCheckbox.check()
    await titleField.fill(createdDocument.title)
    await page.locator('#beskrivelse').getByRole('textbox').fill(createdDocument.description)
    await page.waitForTimeout(750)

    await page.getByRole('button', { name: 'Hva hvis jeg ikke finner person' }).click()
    await page.getByLabel('Skriv inn Nav ident dersom du ikke finner person over').fill(mockIdent)
    await page.locator('#resourcesData').getByRole('button', { name: 'Legg til' }).click()

    await page.getByRole('button', { name: 'Legg til epost' }).click()
    await page.getByRole('button', { name: 'Legg til Epost', exact: true }).click()
    await page.getByLabel('Avdeling').selectOption(createdDocument.departmentId)

    await expect(titleField).toHaveValue(createdDocument.title)
    await page.getByRole('button', { name: 'Opprett', exact: true }).click()

    await expect(page).toHaveURL(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)
  })

  test('se etterlevelsesdokumentet som jeg har opprettet', async ({ context, page }) => {
    await mockAdmin(page)

    await context.route('**/api/codelist?refresh=false', async (route) => {
      await route.fulfill({
        json: {
          codelist: {
            RELEVANS: [
              {
                list: 'RELEVANS',
                code: 'BEHANDLER_PERSONOPPLYSNINGER',
                shortName: 'Behandler personopplysninger',
                description: 'Etterlevelsen behandler personopplysninger',
              },
            ],
          },
        },
      })
    })
    await context.route('**/api/team?myTeams=true', async (route) => {
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
    await context.route(`**/api/etterlevelsedokumentasjon/${createdDocument.id}`, async (route) => {
      await route.fulfill({
        json: {
          id: createdDocument.id,
          changeStamp: {
            createdDate: '2026-09-24T08:00:00Z',
            lastModifiedDate: '2026-09-24T08:00:00Z',
            lastModifiedBy: mockIdent,
          },
          version: 1,
          title: createdDocument.title,
          beskrivelse: createdDocument.description,
          status: 'UNDER_ARBEID',
          meldingEtterlevelerTilRisikoeier: '',
          meldingRisikoeierTilEtterleveler: '',
          etterlevelseNummer: 1,
          etterlevelseDokumentVersjon: 1,
          behandlingIds: ['behandling-1'],
          behandlinger: [
            {
              id: 'behandling-1',
              navn: 'Testbehandling',
              nummer: 101,
              overordnetFormaal: { shortName: 'Testformål' },
            },
          ],
          dpBehandlingIds: ['dp-behandling-1'],
          dpBehandlinger: [
            {
              id: 'dp-behandling-1',
              navn: 'Databehandlerbehandling',
              nummer: 202,
            },
          ],
          nomAvdelingId: createdDocument.departmentId,
          avdelingNavn: createdDocument.departmentName,
          seksjoner: [{ nomSeksjonId: 'seksjon-1', nomSeksjonName: createdDocument.sectionName }],
          enheter: [{ nomEnhetId: 'enhet-1', nomEnhetName: createdDocument.unitName }],
          teams: ['team-1'],
          teamsData: [{ id: 'team-1', name: createdDocument.teamName, members: [] }],
          resources: [mockIdent],
          resourcesData: [
            {
              navIdent: mockIdent,
              givenName: mockIdent,
              familyName: mockIdent,
              fullName: mockIdent,
              email: mockIdent,
              resourceType: mockIdent,
            },
          ],
          risikoeiere: ['R123456'],
          risikoeiereData: [
            {
              navIdent: 'R123456',
              givenName: 'Test',
              familyName: 'Risikoeier',
              fullName: createdDocument.riskOwnerName,
              email: 'test.risikoeier@nav.no',
              resourceType: 'INTERNAL',
            },
          ],
          varslingsadresser: [{ type: 'EPOST', adresse: createdDocument.email }],
          irrelevansFor: [],
          prioritertKravNummer: [],
          risikovurderinger: [createdDocument.riskAssessment],
          p360Recno: 12345,
          p360CaseNumber: createdDocument.p360CaseNumber,
          ardoqSystemIds: ['ardoq-system-1'],
          ardoqSystemData: [
            {
              ardoqUrlId: 'ardoq-url-1',
              ardoqID: 'ardoq-system-1',
              navn: createdDocument.systemName,
            },
          ],
          behandlerPersonopplysninger: true,
          forGjenbruk: true,
          tilgjengeligForGjenbruk: true,
          gjenbrukBeskrivelse: createdDocument.reuseDescription,
          versjonHistorikk: [{ versjon: 1, kravTilstandHistorikk: [] }],
          hasCurrentUserAccess: true,
        },
      })
    })
    await context.route('**/api/team/team-1', async (route) => {
      await route.fulfill({
        json: { id: 'team-1', name: createdDocument.teamName, members: [] },
      })
    })
    await context.route('**/nom/enhet/seksjon/seksjon-1', async (route) => {
      await route.fulfill({ json: [{ id: 'enhet-1', navn: createdDocument.unitName }] })
    })
    await context.route(`**/documentrelation/todocument/${createdDocument.id}**`, async (route) => {
      await route.fulfill({ json: [] })
    })
    await context.route(
      `**/pvkdokument/etterlevelsedokument/${createdDocument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlingenslivslop/etterlevelsedokument/${createdDocument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlings-art-og-omfang/etterlevelsedokumentasjon/${createdDocument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route('**/kravprioritylist?pageNumber=0&pageSize=100', async (route) => {
      await route.fulfill({
        json: {
          pageNumber: 0,
          pageSize: 100,
          pages: 0,
          numberOfElements: 0,
          totalElements: 0,
          content: [],
        },
      })
    })
    await context.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName === 'getEtterlevelseDokumentasjonStats') {
        await route.fulfill({
          json: {
            data: {
              etterlevelseDokumentasjon: {
                content: [{ stats: { relevantKrav: [], utgaattKrav: [] } }],
              },
            },
          },
        })
        return
      }

      await route.continue()
    })

    await page.goto(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)

    await expect(page).toHaveURL(`http://localhost:3000/dokumentasjon/${createdDocument.id}`)
    await expect(page.getByRole('heading', { name: `E1.1 ${createdDocument.title}` })).toBeVisible()
    await expect(page.getByText('Etterlevelse: Under arbeid')).toBeVisible()
    await expect(page.getByText('PVK: Ikke vurdert behov')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Alle Krav' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Prioritert kravliste' })).toBeVisible()

    await page.getByRole('button', { name: 'Les mer om dette dokumentet' }).click()

    await expect(page.getByText(createdDocument.description)).toBeVisible()
    await expect(page.getByText('Behandler personopplysninger')).toBeVisible()
    await expect(page.getByRole('link', { name: createdDocument.treatmentName })).toBeVisible()
    await expect(
      page.getByRole('link', { name: createdDocument.dataProcessorTreatmentName })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(createdDocument.systemName) })
    ).toBeVisible()
    await expect(page.getByText(createdDocument.riskAssessment)).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(createdDocument.p360CaseNumber) })
    ).toBeVisible()
    await expect(page.getByText(createdDocument.departmentName)).toBeVisible()
    await expect(page.getByText(createdDocument.sectionName)).toBeVisible()
    await expect(page.getByText(createdDocument.unitName)).toBeVisible()
    await expect(page.getByText(createdDocument.riskOwnerName)).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(createdDocument.teamName) })
    ).toBeVisible()
    await expect(
      page
        .getByText('Personer:', { exact: true })
        .locator('..')
        .getByText(mockIdent, { exact: true })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: createdDocument.email })).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Du kan gjenbruke dette etterlevelsesdokumentet' })
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Du kan gjenbruke dette etterlevelsesdokumentet' })
      .click()
    await expect(page.getByText(createdDocument.reuseDescription)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gjenbruk dokumentet' })).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Se hvilke etterlevelser som allerede gjenbruker dette dokumentet',
      })
    ).toBeVisible()
  })
})

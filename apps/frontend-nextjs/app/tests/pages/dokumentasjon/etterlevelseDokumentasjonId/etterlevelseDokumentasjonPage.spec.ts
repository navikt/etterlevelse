import test, { expect } from '@playwright/test'
import { oppretteEtterlevelsesdokument } from '@/tests/utils/etterlevelsesdokument'
import {
  mockAdmin,
  mockIdent,
  mockKraveier,
  mockPersonvernombud,
  mockRead,
  mockWrite,
} from '@/tests/utils/roller'

const visibleRequirements = [
  { number: 101, version: 1, name: 'Behandle personopplysninger lovlig' },
  { number: 102, version: 2, name: 'Sikre den registretes rettigheter' },
  { number: 201, version: 1, name: 'Dokumentere internkontroll' },
]

const expiredRequirement = {
  number: 301,
  version: 1,
  name: 'Utgått krav til behandlingsoversikt',
}

const roleScenarios = [
  {
    name: 'admin',
    mockUser: mockAdmin,
    canEditWithoutDocumentAccess: true,
    pvkMenuItems: [
      'Tegn Behandlingens livsløp',
      'Beskriv behandlingens art og omfang',
      'Vurder behov for PVK',
    ],
  },
  {
    name: 'kraveier',
    mockUser: mockKraveier,
    canEditWithoutDocumentAccess: false,
    pvkMenuItems: [],
  },
  {
    name: 'lesebruker',
    mockUser: mockRead,
    canEditWithoutDocumentAccess: false,
    pvkMenuItems: [],
  },
  {
    name: 'skrivebruker',
    mockUser: mockWrite,
    canEditWithoutDocumentAccess: false,
    pvkMenuItems: [],
  },
  {
    name: 'personvernombud',
    mockUser: mockPersonvernombud,
    canEditWithoutDocumentAccess: false,
    pvkMenuItems: [
      'Se Behandlingens livsløp',
      'Se behandlingens art og omfang',
      'Les om behov for PVK',
    ],
  },
]

test.describe('Som en admin bruker skal jeg kunne', () => {
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

    await context.route(
      `**/api/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({
          json: {
            id: oppretteEtterlevelsesdokument.id,
            changeStamp: {
              createdDate: '2026-09-24T08:00:00Z',
              lastModifiedDate: '2026-09-24T08:00:00Z',
              lastModifiedBy: mockIdent,
            },
            version: 1,
            title: oppretteEtterlevelsesdokument.title,
            beskrivelse: oppretteEtterlevelsesdokument.description,
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
            nomAvdelingId: oppretteEtterlevelsesdokument.departmentId,
            avdelingNavn: oppretteEtterlevelsesdokument.departmentName,
            seksjoner: [
              {
                nomSeksjonId: 'seksjon-1',
                nomSeksjonName: oppretteEtterlevelsesdokument.sectionName,
              },
            ],
            enheter: [
              { nomEnhetId: 'enhet-1', nomEnhetName: oppretteEtterlevelsesdokument.unitName },
            ],
            teams: ['team-1'],
            teamsData: [
              { id: 'team-1', name: oppretteEtterlevelsesdokument.teamName, members: [] },
            ],
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
                fullName: oppretteEtterlevelsesdokument.riskOwnerName,
                email: 'test.risikoeier@nav.no',
                resourceType: 'INTERNAL',
              },
            ],
            varslingsadresser: [{ type: 'EPOST', adresse: oppretteEtterlevelsesdokument.email }],
            irrelevansFor: [],
            prioritertKravNummer: [],
            risikovurderinger: [oppretteEtterlevelsesdokument.riskAssessment],
            p360Recno: 12345,
            p360CaseNumber: oppretteEtterlevelsesdokument.p360CaseNumber,
            ardoqSystemIds: ['ardoq-system-1'],
            ardoqSystemData: [
              {
                ardoqUrlId: 'ardoq-url-1',
                ardoqID: 'ardoq-system-1',
                navn: oppretteEtterlevelsesdokument.systemName,
              },
            ],
            behandlerPersonopplysninger: true,
            forGjenbruk: true,
            tilgjengeligForGjenbruk: true,
            gjenbrukBeskrivelse: oppretteEtterlevelsesdokument.reuseDescription,
            versjonHistorikk: [{ versjon: 1, kravTilstandHistorikk: [] }],
            hasCurrentUserAccess: true,
          },
        })
      }
    )

    await context.route('**/api/team/team-1', async (route) => {
      await route.fulfill({
        json: { id: 'team-1', name: oppretteEtterlevelsesdokument.teamName, members: [] },
      })
    })

    await context.route('**/nom/enhet/seksjon/seksjon-1', async (route) => {
      await route.fulfill({
        json: [{ id: 'enhet-1', navn: oppretteEtterlevelsesdokument.unitName }],
      })
    })

    await context.route(
      `**/documentrelation/todocument/${oppretteEtterlevelsesdokument.id}**`,
      async (route) => {
        await route.fulfill({ json: [] })
      }
    )

    await context.route(
      `**/pvkdokument/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlingenslivslop/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlings-art-og-omfang/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
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

    await page.goto(`http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`)

    await expect(page).toHaveURL(
      `http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`
    )
    await expect(
      page.getByRole('heading', { name: `E1.1 ${oppretteEtterlevelsesdokument.title}` })
    ).toBeVisible()
    await expect(page.getByText('Etterlevelse: Under arbeid')).toBeVisible()
    await expect(page.getByText('PVK: Ikke vurdert behov')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Alle Krav' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Prioritert kravliste' })).toBeVisible()

    await page.getByRole('button', { name: 'Les mer om dette dokumentet' }).click()

    await expect(page.getByText(oppretteEtterlevelsesdokument.description)).toBeVisible()
    await expect(page.getByText('Behandler personopplysninger')).toBeVisible()
    await expect(
      page.getByRole('link', { name: oppretteEtterlevelsesdokument.treatmentName })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: oppretteEtterlevelsesdokument.dataProcessorTreatmentName })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(oppretteEtterlevelsesdokument.systemName) })
    ).toBeVisible()
    await expect(page.getByText(oppretteEtterlevelsesdokument.riskAssessment)).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(oppretteEtterlevelsesdokument.p360CaseNumber) })
    ).toBeVisible()
    await expect(page.getByText(oppretteEtterlevelsesdokument.departmentName)).toBeVisible()
    await expect(page.getByText(oppretteEtterlevelsesdokument.sectionName)).toBeVisible()
    await expect(page.getByText(oppretteEtterlevelsesdokument.unitName)).toBeVisible()
    await expect(page.getByText(oppretteEtterlevelsesdokument.riskOwnerName)).toBeVisible()
    await expect(
      page.getByRole('link', { name: new RegExp(oppretteEtterlevelsesdokument.teamName) })
    ).toBeVisible()
    await expect(
      page
        .getByText('Personer:', { exact: true })
        .locator('..')
        .getByText(mockIdent, { exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: oppretteEtterlevelsesdokument.email })
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Du kan gjenbruke dette etterlevelsesdokumentet' })
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Du kan gjenbruke dette etterlevelsesdokumentet' })
      .click()
    await expect(page.getByText(oppretteEtterlevelsesdokument.reuseDescription)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gjenbruk dokumentet' })).toBeVisible()
    await expect(
      page.getByRole('link', {
        name: 'Se hvilke etterlevelser som allerede gjenbruker dette dokumentet',
      })
    ).toBeVisible()
  })

  test('se liste av krav som følger etterlevelsesdokumentet jeg har opprettet', async ({
    context,
    page,
  }) => {
    await mockAdmin(page)

    await context.route('**/api/codelist?refresh=false', async (route) => {
      await route.fulfill({
        json: {
          codelist: {
            TEMA: [
              {
                list: 'TEMA',
                code: 'PERSONVERN',
                shortName: 'Personvern',
                description: 'Krav til personvern',
                data: {},
              },
              {
                list: 'TEMA',
                code: 'INTERNKONTROLL',
                shortName: 'Internkontroll',
                description: 'Krav til internkontroll',
                data: {},
              },
            ],
            LOV: [
              {
                list: 'LOV',
                code: 'PERSONOPPLYSNINGSLOVEN',
                shortName: 'Personopplysningsloven',
                description: 'Personopplysningsloven',
                data: { tema: 'PERSONVERN' },
              },
              {
                list: 'LOV',
                code: 'INTERNKONTROLLFORSKRIFTEN',
                shortName: 'Internkontrollforskriften',
                description: 'Internkontrollforskriften',
                data: { tema: 'INTERNKONTROLL' },
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

    await context.route(
      `**/api/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({
          json: {
            id: oppretteEtterlevelsesdokument.id,
            title: oppretteEtterlevelsesdokument.title,
            status: 'UNDER_ARBEID',
            etterlevelseNummer: 1,
            etterlevelseDokumentVersjon: 1,
            prioritertKravNummer: [visibleRequirements[0].number.toString()],
            irrelevansFor: [],
            hasCurrentUserAccess: true,
          },
        })
      }
    )

    await context.route(
      `**/documentrelation/todocument/${oppretteEtterlevelsesdokument.id}**`,
      async (route) => {
        await route.fulfill({ json: [] })
      }
    )

    await context.route(
      `**/pvkdokument/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlingenslivslop/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route(
      `**/behandlings-art-og-omfang/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
      async (route) => {
        await route.fulfill({ status: 404 })
      }
    )
    await context.route('**/kravprioritylist?pageNumber=0&pageSize=100', async (route) => {
      await route.fulfill({
        json: {
          pageNumber: 0,
          pageSize: 100,
          pages: 1,
          numberOfElements: 2,
          totalElements: 2,
          content: [
            {
              id: 'priority-personvern',
              temaId: 'PERSONVERN',
              priorityList: [101, 102],
            },
            {
              id: 'priority-internkontroll',
              temaId: 'INTERNKONTROLL',
              priorityList: [201],
            },
          ],
        },
      })
    })

    await context.route(
      `**/etterlevelsemetadata/etterlevelseDokumentasjon/${oppretteEtterlevelsesdokument.id}/**`,
      async (route) => {
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
      }
    )
    await context.route(
      `**/etterlevelse/etterlevelseDokumentasjon/${oppretteEtterlevelsesdokument.id}/**`,
      async (route) => {
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
      }
    )
    await context.route('**/graphql', async (route) => {
      const requestBody = route.request().postDataJSON() as { operationName?: string }

      if (requestBody.operationName === 'getEtterlevelseDokumentasjonStats') {
        const mockRequirement = (
          number: number,
          version: number,
          name: string,
          lawCode: string,
          completed = false
        ) => ({
          kravNummer: number,
          kravVersjon: version,
          navn: name,
          status: 'AKTIV',
          aktivertDato: '2025-01-01T00:00:00Z',
          tagger: [],
          suksesskriterier: [],
          changeStamp: {
            createdDate: '2025-01-01T00:00:00Z',
            lastModifiedDate: '2025-01-01T00:00:00Z',
            lastModifiedBy: mockIdent,
          },
          etterlevelser: completed
            ? [
                {
                  id: `etterlevelse-${number}`,
                  status: 'FERDIG_DOKUMENTERT',
                  etterlevelseDokumentasjonId: oppretteEtterlevelsesdokument.id,
                  fristForFerdigstillelse: '',
                  suksesskriterieBegrunnelser: [],
                  changeStamp: {
                    createdDate: '2025-01-01T00:00:00Z',
                    lastModifiedDate: '2025-01-01T00:00:00Z',
                    lastModifiedBy: mockIdent,
                  },
                },
              ]
            : [],
          regelverk: [{ lov: { code: lawCode } }],
        })

        await route.fulfill({
          json: {
            data: {
              etterlevelseDokumentasjon: {
                content: [
                  {
                    stats: {
                      relevantKrav: [
                        mockRequirement(
                          visibleRequirements[0].number,
                          visibleRequirements[0].version,
                          visibleRequirements[0].name,
                          'PERSONOPPLYSNINGSLOVEN',
                          true
                        ),
                        mockRequirement(
                          visibleRequirements[1].number,
                          visibleRequirements[1].version,
                          visibleRequirements[1].name,
                          'PERSONOPPLYSNINGSLOVEN'
                        ),
                        mockRequirement(
                          visibleRequirements[2].number,
                          visibleRequirements[2].version,
                          visibleRequirements[2].name,
                          'INTERNKONTROLLFORSKRIFTEN'
                        ),
                      ],
                      utgaattKrav: [
                        {
                          ...mockRequirement(
                            expiredRequirement.number,
                            expiredRequirement.version,
                            expiredRequirement.name,
                            'INTERNKONTROLLFORSKRIFTEN'
                          ),
                          status: 'UTGAATT',
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        })
        return
      }

      if (requestBody.operationName === 'getKravByFilter') {
        await route.fulfill({
          json: {
            data: {
              krav: {
                content: visibleRequirements.map((requirement) => ({
                  navn: requirement.name,
                  kravNummer: requirement.number,
                  kravVersjon: requirement.version,
                  status: 'AKTIV',
                  prioriteringsId: null,
                  etterlevelser: [],
                })),
              },
            },
          },
        })
        return
      }

      await route.continue()
    })

    const documentUrl = `http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`
    const documentOverviewUrl = `${documentUrl}?tema=all-open`

    await page.goto(documentUrl)
    const expandAllThemes = page.getByRole('checkbox', { name: 'Ekspander alle temaer' })
    await expect(expandAllThemes).not.toBeChecked()
    await expandAllThemes.click()
    await expect(expandAllThemes).toBeChecked()
    await expect(page).toHaveURL(documentOverviewUrl)

    await expect(page.getByText('Totalt 3 krav, 1 ferdig utfylt')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Personvern \(1 av 2 krav er ferdig utfylt\)/ })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Internkontroll \(0 av 2 krav er ferdig utfylt\)/ })
    ).toBeVisible()

    for (const requirement of visibleRequirements) {
      await expect(
        page.getByRole('link', {
          name: new RegExp(`K${requirement.number}\\.${requirement.version}.*${requirement.name}`),
        })
      ).toBeVisible()
    }

    await expect(
      page.getByRole('link', {
        name: new RegExp(
          `K${expiredRequirement.number}\\.${expiredRequirement.version}.*${expiredRequirement.name}`
        ),
      })
    ).toBeVisible()
    await expect(page.getByText('Utgått krav', { exact: true })).toBeVisible()

    const requirementLinks = [
      ...visibleRequirements.slice(0, 2).map((requirement) => ({
        ...requirement,
        theme: 'PERSONVERN',
      })),
      { ...visibleRequirements[2], theme: 'INTERNKONTROLL' },
      { ...expiredRequirement, theme: 'INTERNKONTROLL' },
    ]

    for (const requirement of requirementLinks) {
      const requirementUrl =
        `/dokumentasjon/${oppretteEtterlevelsesdokument.id}/${requirement.theme}` +
        `/krav/${requirement.number}/${requirement.version}`
      const requirementLink = page.getByRole('link', {
        name: new RegExp(`K${requirement.number}\\.${requirement.version}.*${requirement.name}`),
      })

      await expect(requirementLink).toHaveAttribute('href', requirementUrl)
      await Promise.all([
        page.waitForURL(`http://localhost:3000${requirementUrl}`),
        requirementLink.click(),
      ])
      await page.goBack()
      await expect(page).toHaveURL(documentOverviewUrl)
      await expect(expandAllThemes).toBeChecked()
    }

    await page.getByRole('tab', { name: 'Prioritert kravliste' }).click()
    await expect(
      page.getByRole('link', {
        name: new RegExp(
          `K${visibleRequirements[0].number}\\.${visibleRequirements[0].version}.*${visibleRequirements[0].name}`
        ),
      })
    ).toBeVisible()
    for (const requirement of visibleRequirements.slice(1)) {
      await expect(
        page.getByRole('link', {
          name: new RegExp(`K${requirement.number}\\.${requirement.version}.*${requirement.name}`),
        })
      ).toHaveCount(0)
    }
    await expect(
      page.getByRole('link', {
        name: new RegExp(
          `K${expiredRequirement.number}\\.${expiredRequirement.version}.*${expiredRequirement.name}`
        ),
      })
    ).toHaveCount(0)
  })
})

test.describe('Tilgang til etterlevelsesdokumentasjon for alle brukerroller', () => {
  for (const role of roleScenarios) {
    test(`${role.name} kan opprette og lese, med forventet redigeringstilgang`, async ({
      context,
      page,
    }) => {
      await role.mockUser(page)

      await context.route('**/api/codelist?refresh=false', async (route) => {
        await route.fulfill({
          json: {
            codelist: {
              TEMA: [
                { list: 'TEMA', code: 'PERSONVERN', shortName: 'Personvern', data: {} },
                {
                  list: 'TEMA',
                  code: 'INTERNKONTROLL',
                  shortName: 'Internkontroll',
                  data: {},
                },
              ],
              LOV: [
                {
                  list: 'LOV',
                  code: 'PERSONOPPLYSNINGSLOVEN',
                  shortName: 'Personopplysningsloven',
                  data: { tema: 'PERSONVERN' },
                },
                {
                  list: 'LOV',
                  code: 'INTERNKONTROLLFORSKRIFTEN',
                  shortName: 'Internkontrollforskriften',
                  data: { tema: 'INTERNKONTROLL' },
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
        await route.fulfill({ json: [] })
      })

      await context.route(
        `**/api/etterlevelsedokumentasjon/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({
            json: {
              id: oppretteEtterlevelsesdokument.id,
              title: oppretteEtterlevelsesdokument.title,
              beskrivelse: oppretteEtterlevelsesdokument.description,
              status: 'UNDER_ARBEID',
              etterlevelseNummer: 1,
              etterlevelseDokumentVersjon: 1,
              resources: [],
              resourcesData: [],
              teams: [],
              teamsData: [],
              risikoeiere: [],
              risikoeiereData: [],
              irrelevansFor: [],
              varslingsadresser: [{ type: 'EPOST', adresse: oppretteEtterlevelsesdokument.email }],
              hasCurrentUserAccess: false,
            },
          })
        }
      )
      await context.route(
        `**/documentrelation/todocument/${oppretteEtterlevelsesdokument.id}**`,
        async (route) => {
          await route.fulfill({ json: [] })
        }
      )
      await context.route(
        `**/pvkdokument/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlingenslivslop/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route(
        `**/behandlingens-art-og-omfang/etterlevelsedokument/${oppretteEtterlevelsesdokument.id}`,
        async (route) => {
          await route.fulfill({ status: 404 })
        }
      )
      await context.route('**/kravprioritylist?pageNumber=0&pageSize=100', async (route) => {
        await route.fulfill({
          json: {
            pageNumber: 0,
            pageSize: 100,
            pages: 1,
            numberOfElements: 2,
            totalElements: 2,
            content: [
              {
                id: 'priority-personvern',
                temaId: 'PERSONVERN',
                priorityList: [101, 102],
              },
              {
                id: 'priority-internkontroll',
                temaId: 'INTERNKONTROLL',
                priorityList: [201],
              },
            ],
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
                  content: [
                    {
                      stats: {
                        relevantKrav: visibleRequirements.map((requirement, index) => ({
                          kravNummer: requirement.number,
                          kravVersjon: requirement.version,
                          navn: requirement.name,
                          status: 'AKTIV',
                          aktivertDato: '2025-01-01T00:00:00Z',
                          tagger: [],
                          suksesskriterier: [],
                          changeStamp: {
                            createdDate: '2025-01-01T00:00:00Z',
                            lastModifiedDate: '2025-01-01T00:00:00Z',
                            lastModifiedBy: mockIdent,
                          },
                          etterlevelser:
                            index === 0
                              ? [
                                  {
                                    id: `etterlevelse-${requirement.number}`,
                                    status: 'FERDIG_DOKUMENTERT',
                                    etterlevelseDokumentasjonId: oppretteEtterlevelsesdokument.id,
                                    suksesskriterieBegrunnelser: [],
                                  },
                                ]
                              : [],
                          regelverk: [
                            {
                              lov: {
                                code:
                                  index < 2
                                    ? 'PERSONOPPLYSNINGSLOVEN'
                                    : 'INTERNKONTROLLFORSKRIFTEN',
                              },
                            },
                          ],
                        })),
                        utgaattKrav: [],
                      },
                    },
                  ],
                },
              },
            },
          })
          return
        }

        await route.continue()
      })

      const documentUrl = `http://localhost:3000/dokumentasjon/${oppretteEtterlevelsesdokument.id}`
      const navigationUrls = [
        documentUrl,
        `${documentUrl}?tema=PERSONVERN`,
        `${documentUrl}?tema=all-open`,
        `${documentUrl}?tema=all-closed`,
      ]

      for (const navigationUrl of navigationUrls) {
        await page.goto(navigationUrl)
        await expect(page).toHaveURL(navigationUrl)
        await expect(
          page.getByRole('heading', { name: `E1.1 ${oppretteEtterlevelsesdokument.title}` })
        ).toBeVisible()
      }

      await page.goto(`${documentUrl}?tema=all-open`)
      await expect(
        page.getByRole('heading', { name: `E1.1 ${oppretteEtterlevelsesdokument.title}` })
      ).toBeVisible()
      await expect(page.getByText('Etterlevelse: Under arbeid')).toBeVisible()
      await expect(page.getByText('PVK: Ikke vurdert behov')).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Alle Krav' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Prioritert kravliste' })).toBeVisible()
      await expect(page.getByRole('textbox', { name: 'Søk etter kravet' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: /Velg fullføringsgrad på kravnivå/ })
      ).toBeVisible()
      await expect(page.getByRole('button', { name: /Velg suksesskriterie-status/ })).toBeVisible()
      await expect(page.getByRole('checkbox', { name: 'Ekspander alle temaer' })).toBeChecked()
      await expect(page.getByText('Totalt 3 krav, 1 ferdig utfylt')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Arkiver i Public 360' })).toBeVisible()

      await page.getByRole('button', { name: 'Etterlevelse' }).click()
      await expect(page.getByRole('menuitem', { name: 'Eksporter til Word' })).toBeVisible()

      const editDocumentLink = page.getByRole('menuitem', {
        name: 'Rediger dokumentegenskaper',
      })
      if (role.canEditWithoutDocumentAccess) {
        await expect(editDocumentLink).toBeVisible()
        await expect(
          page.getByRole('menuitem', { name: 'Få etterlevelsen godkjent av risikoeier' })
        ).toBeVisible()
      } else {
        await expect(editDocumentLink).toHaveCount(0)
        await expect(
          page.getByRole('menuitem', { name: 'Få etterlevelsen godkjent av risikoeier' })
        ).toHaveCount(0)
      }

      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Les mer om dette dokumentet' }).click()
      await expect(page.getByRole('heading', { name: 'Dokumentbeskrivelse' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Dokumentegenskaper' })).toBeVisible()
      await expect(page.getByText(oppretteEtterlevelsesdokument.description)).toBeVisible()

      if (role.canEditWithoutDocumentAccess) {
        await expect(
          page.getByRole('link', { name: oppretteEtterlevelsesdokument.email })
        ).toBeVisible()
        await expect(
          page.getByText(/Trenger du tilgang til å redigere dette dokumentet/)
        ).toHaveCount(0)
      } else {
        await expect(
          page.getByText(/Trenger du tilgang til å redigere dette dokumentet/)
        ).toBeVisible()
        await expect(
          page.getByRole('link', { name: oppretteEtterlevelsesdokument.email })
        ).toHaveCount(0)
      }

      const pvkButton = page.getByRole('button', {
        name: 'Personvernkonsekvensvurdering (PVK)',
      })
      if (role.pvkMenuItems.length > 0) {
        await expect(pvkButton).toBeVisible()
        await pvkButton.click()
        for (const menuItem of role.pvkMenuItems) {
          await expect(page.getByRole('menuitem', { name: menuItem })).toBeVisible()
        }
        await page.keyboard.press('Escape')
      } else {
        await expect(pvkButton).toHaveCount(0)
      }

      const reuseButton = page.getByRole('button', { name: 'Gjenbruk' })
      if (role.canEditWithoutDocumentAccess) {
        await expect(reuseButton).toBeVisible()
        await reuseButton.click()
        await expect(
          page.getByRole('menuitem', { name: 'Tilrettelegg for gjenbruk' })
        ).toBeVisible()
        await page.keyboard.press('Escape')
      } else {
        await expect(reuseButton).toHaveCount(0)
      }

      await page.getByRole('tab', { name: 'Prioritert kravliste' }).click()
      await expect(page.getByText('Ingen prioriterte krav i listen')).toBeVisible()
      const editPrioritizedRequirementsButton = page.getByRole('button', {
        name: 'Rediger prioriterte krav',
      })
      if (role.canEditWithoutDocumentAccess) {
        await expect(editPrioritizedRequirementsButton).toBeVisible()
      } else {
        await expect(editPrioritizedRequirementsButton).toHaveCount(0)
      }
    })
  }
})

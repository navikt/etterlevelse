import { BrowserContext, Route, expect } from '@playwright/test'
import { mapRisikoscenarioToFormValue } from '@/api/risikoscenario/risikoscenarioApi'
import { mapTiltakToFormValue } from '@/api/tiltak/tiltakApi'
import { EAuditAction, EObjectType, IAuditItem } from '@/constants/admin/audit/auditConstants'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IDomainObject, IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { EEtterlevelseStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  IKravRisikoscenarioRelasjon,
  IRisikoscenario,
  ITiltakRisikoscenarioRelasjon,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { EListName, IAllCodelists, ICode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { IP360UserPageResponse } from '@/constants/p360/p360Constants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'

interface IPvkMockSnapshot {
  dokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  behandlingensLivslop: IBehandlingensLivslop
  artOgOmfang: IBehandlingensArtOgOmfang
  risikoscenarioer: IRisikoscenario[]
  tiltak: ITiltak[]
  pvoTilbakemelding: IPvoTilbakemelding
}

export interface IPvkMockData extends IPvkMockSnapshot {
  krav: TKravQL[]
  codelists: IAllCodelists
  p360User: IP360UserPageResponse
  historikk: IPvkMockSnapshot
}

const mockPage = <T>(content: T[]): IPageResponse<T> => ({
  pageNumber: 0,
  pageSize: Math.max(20, content.length),
  pages: content.length ? 1 : 0,
  numberOfElements: content.length,
  totalElements: content.length,
  content,
})

export const createPvkMockData = (
  seed: Omit<IPvkMockSnapshot, 'pvoTilbakemelding'>,
  resource: ITeamResource
): IPvkMockData => {
  const data = structuredClone(seed)
  const code = (list: EListName, value: string, shortName: string): ICode => ({
    list,
    code: value,
    shortName,
    description: shortName,
    data: {},
  })
  const personvern = code(EListName.TEMA, 'PVK', 'Personvern')
  const lov = {
    ...code(EListName.LOV, 'PERSONOPPLYSNINGSLOVEN', 'Personopplysningsloven'),
    data: { tema: personvern.code },
  }
  const egenskap = code(
    EListName.YTTERLIGERE_EGENSKAPER,
    'SARBARE_REGISTRERTE',
    'Sårbare registrerte'
  )
  const vurdering = code(EListName.PVO_VURDERING, 'TILSTREKKELIG', 'Tilstrekkelig dokumentert')
  const eksternKode = {
    list: 'PERSONKATEGORI',
    code: 'BRUKER',
    shortName: 'Brukere',
    description: 'Brukere av tjenesten',
  }
  data.dokumentasjon.behandlingIds = ['behandling-1']
  data.dokumentasjon.behandlinger = [
    {
      id: 'behandling-1',
      navn: 'Behandle søknader',
      nummer: 101,
      overordnetFormaal: { ...eksternKode, shortName: 'Saksbehandling' },
      linjer: [],
      systemer: [],
      teams: [data.tiltak[0].ansvarligTeam.id],
      policies: [
        {
          id: 'policy-1',
          behandlingId: 'behandling-1',
          opplysningsTypeId: 'opplysning-1',
          opplysningsTypeNavn: 'Kontaktopplysninger',
          personKategorier: [eksternKode],
          sensitivity: [],
        },
      ],
      dataBehandlerList: [{ id: 'databehandler-1', navn: 'Testdatabehandler' }],
      automatiskBehandling: false,
      profilering: false,
      brukerAlleOpplysningstyper: true,
    },
  ]
  data.dokumentasjon.dpBehandlingIds = ['dp-behandling-1']
  data.dokumentasjon.dpBehandlinger = [
    { id: 'dp-behandling-1', navn: 'Databehandling for testtjenesten', nummer: 202, art9: false },
  ]
  data.dokumentasjon.teams = [data.tiltak[0].ansvarligTeam.id]
  data.dokumentasjon.teamsData = [data.tiltak[0].ansvarligTeam]
  data.dokumentasjon.risikovurderinger = ['https://example.test/ros']
  data.pvkDokument.ytterligereEgenskaper = [egenskap]
  const pvoTilbakemelding: IPvoTilbakemelding = {
    id: 'pvo-1',
    changeStamp: data.pvkDokument.changeStamp,
    version: 1,
    pvkDokumentId: data.pvkDokument.id,
    status: EPvoTilbakemeldingStatus.FERDIG,
    vurderinger: [1, 2].map((innsendingId) => {
      const innhold = {
        sistRedigertAv: resource.navIdent,
        sistRedigertDato: '2026-10-25T10:00:00Z',
        bidragsVurdering: vurdering.code,
        internDiskusjon: '',
        tilbakemeldingTilEtterlevere: `PVO-tilbakemelding fra innsending ${innsendingId}`,
      }
      return {
        ...createNewPvoVurderning(innsendingId, data.dokumentasjon.etterlevelseDokumentVersjon),
        sendtAv: resource.fullName,
        sendtDato: innhold.sistRedigertDato,
        ansvarlig: [resource.navIdent],
        ansvarligData: [resource],
        arbeidGarVidere: true,
        behovForForhandskonsultasjon: false,
        pvoVurdering: vurdering.code,
        vilFaPvkIRetur: true,
        merknadTilEtterleverEllerRisikoeier: 'Dokumentasjonen er vurdert av PVO',
        behandlingenslivslop: { ...innhold },
        behandlingensArtOgOmfang: { ...innhold },
        innvolveringAvEksterne: { ...innhold },
        risikoscenarioEtterTiltakk: { ...innhold },
        tilhorendeDokumentasjon: {
          ...createNewPvoVurderning(innsendingId, 1).tilhorendeDokumentasjon,
          behandlingskatalogDokumentasjonTilstrekkelig: vurdering.code,
          behandlingskatalogDokumentasjonTilbakemelding: innhold.tilbakemeldingTilEtterlevere,
          kravDokumentasjonTilstrekkelig: vurdering.code,
          kravDokumentasjonTilbakemelding: innhold.tilbakemeldingTilEtterlevere,
          risikovurderingTilstrekkelig: vurdering.code,
          risikovurderingTilbakemelding: innhold.tilbakemeldingTilEtterlevere,
        },
      }
    }),
  }
  const krav: TKravQL = {
    id: 'krav-pvk-1',
    changeStamp: data.pvkDokument.changeStamp,
    version: 1,
    kravNummer: 101,
    kravVersjon: 1,
    navn: 'Dokumenter personvernkonsekvenser',
    beskrivelse: 'Vurder og dokumenter personvernkonsekvenser',
    hensikt: 'Ivareta de registrertes rettigheter',
    utdypendeBeskrivelse: '',
    versjonEndringer: '',
    dokumentasjon: [],
    implementasjoner: '',
    begrepIder: [],
    begreper: [],
    varslingsadresser: [],
    varslingsadresserQl: [],
    rettskilder: [],
    tagger: ['Personvernkonsekvensvurdering'],
    regelverk: [{ lov }],
    avdeling: code(EListName.AVDELING, 'JURIDISK', 'Juridisk avdeling'),
    underavdeling: code(EListName.UNDERAVDELING, 'PERSONVERN', 'Personvern'),
    relevansFor: [],
    status: EKravStatus.AKTIV,
    suksesskriterier: [],
    nyKravVersjon: false,
    kravIdRelasjoner: [],
    kravRelasjoner: [],
    prioriteringsId: 1,
    aktivertDato: '2026-10-01T10:00:00Z',
    varselMelding: '',
    etterlevelser: [
      {
        id: 'etterlevelse-pvk-1',
        changeStamp: data.pvkDokument.changeStamp,
        version: 1,
        behandlingId: 'behandling-1',
        etterlevelseDokumentasjonId: data.dokumentasjon.id,
        etterlevelseDokumentasjon: data.dokumentasjon,
        kravNummer: 101,
        kravVersjon: 1,
        etterleves: true,
        statusBegrunnelse: 'Kravet er dokumentert',
        dokumentasjon: [],
        fristForFerdigstillelse: '',
        status: EEtterlevelseStatus.FERDIG_DOKUMENTERT,
        ikkeBehovForRevurdering: false,
        endretInnholdDato: '2026-10-25T10:00:00Z',
        suksesskriterieBegrunnelser: [],
      },
    ],
  }
  const snapshot = { ...data, pvoTilbakemelding }
  return {
    ...snapshot,
    historikk: structuredClone(snapshot),
    krav: [krav],
    codelists: {
      codelist: {
        [EListName.TEMA]: [personvern],
        [EListName.LOV]: [lov],
        [EListName.YTTERLIGERE_EGENSKAPER]: [egenskap],
        [EListName.PVO_VURDERING]: [vurdering],
      },
    },
    p360User: {
      Successful: true,
      Users: [{ ContactExternalId: resource.navIdent, IsActive: true }],
      TotalPageCount: 1,
      TotalCount: 1,
      ErrorMessage: '',
      ErrorDetails: '',
    },
  }
}

const updated = <T extends IDomainObject>(current: T, changes: Partial<T>): T => ({
  ...current,
  ...changes,
  version: current.version + 1,
  changeStamp: {
    ...current.changeStamp,
    lastModifiedDate: new Date(
      Date.parse(current.changeStamp.lastModifiedDate) + 1000
    ).toISOString(),
  },
})

const notFound = (route: Route) =>
  route.fulfill({ status: 404, json: { message: `Ingen mockdata for ${route.request().url()}` } })

export const mockPvkApi = async (context: BrowserContext, data: IPvkMockData) => {
  const dokumentasjonId = data.dokumentasjon.id
  const pvkDokumentId = data.pvkDokument.id
  let nextId = 1

  // WebKit's intercepted request body omits file contents, including the JSON Blob.
  await context.addInitScript(() => {
    const pending: FormData[] = []
    Object.assign(window, { __pvkMultipartRequests: pending })
    const send = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function (body) {
      if (body instanceof FormData && body.has('request')) {
        pending.push(body)
      }
      send.call(this, body)
    }
  })

  await context.route('**/graphql', (route) => {
    const body: { operationName: string; variables: { nummer?: number; tagger?: string[] } } = route
      .request()
      .postDataJSON()
    expect(body.operationName).toBe('getKravByFilter')
    return route.fulfill({
      json: {
        data: {
          krav: {
            ...mockPage(
              data.krav.filter(
                (krav) =>
                  (!body.variables.nummer || krav.kravNummer === body.variables.nummer) &&
                  (!body.variables.tagger ||
                    body.variables.tagger.every((tag) => krav.tagger.includes(tag)))
              )
            ),
            paged: false,
          },
        },
      },
    })
  })
  await context.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = decodeURIComponent(url.pathname.slice('/api'.length))
    const method = request.method()
    const resource = data.dokumentasjon.resourcesData?.[0]
    const team = data.dokumentasjon.teamsData?.[0]

    if (method === 'GET') {
      const reads: Record<string, unknown> = {
        '/codelist': data.codelists,
        '/melding/type/SYSTEM': mockPage([]),
        '/p360/user': data.p360User,
        '/team': mockPage(data.dokumentasjon.teamsData || []),
        '/team/productarea': mockPage([]),
        [`/team/resource/${resource?.navIdent}`]: resource,
        [`/team/${team?.id}`]: team,
        [`/etterlevelsedokumentasjon/${dokumentasjonId}`]: data.dokumentasjon,
        [`/pvkdokument/${pvkDokumentId}`]: data.pvkDokument,
        [`/pvkdokument/etterlevelsedokument/${dokumentasjonId}`]: data.pvkDokument,
        [`/pvotilbakemelding/pvkdokument/${pvkDokumentId}`]: data.pvoTilbakemelding,
        [`/behandlingenslivslop/etterlevelsedokument/${dokumentasjonId}`]:
          data.behandlingensLivslop,
        [`/behandlingenslivslop/${data.behandlingensLivslop.id}`]: data.behandlingensLivslop,
        [`/behandlingens-art-og-omfang/etterlevelsedokument/${dokumentasjonId}`]: data.artOgOmfang,
        [`/risikoscenario/pvkdokument/${pvkDokumentId}/ALL`]: mockPage(data.risikoscenarioer),
        [`/tiltak/pvkdokument/${pvkDokumentId}`]: mockPage(data.tiltak),
      }
      if (path in reads && reads[path] !== undefined) {
        await route.fulfill({ json: reads[path] })
        return
      }
      const historicalReads: [string, unknown][] = [
        [`/pvkdokument/approved/pvkDokument/${pvkDokumentId}/`, data.historikk.pvkDokument],
        [
          `/pvotilbakemelding/approved/pvkDokument/${pvkDokumentId}/`,
          data.historikk.pvoTilbakemelding,
        ],
        [`/risikoscenario/approved/pvkDokument/${pvkDokumentId}/`, data.historikk.risikoscenarioer],
        [`/tiltak/approved/pvkDokument/${pvkDokumentId}/`, data.historikk.tiltak],
        [
          `/behandlingenslivslop/etterlevelsedokument/${dokumentasjonId}/timestamp/`,
          data.historikk.behandlingensLivslop,
        ],
        [
          `/behandlingens-art-og-omfang/etterlevelsedokument/${dokumentasjonId}/timestamp/`,
          data.historikk.artOgOmfang,
        ],
      ]
      const historical = historicalReads.find(([prefix]) => path.startsWith(prefix))
      if (historical) {
        await route.fulfill({ json: historical[1] })
        return
      }
      if (
        path.startsWith(`/audit/log/${pvkDokumentId}/`) ||
        path.startsWith(`/audit/log/${dokumentasjonId}/`)
      ) {
        const isPvk = path.startsWith(`/audit/log/${pvkDokumentId}/`)
        const audit: IAuditItem = {
          id: 'audit-1',
          action: EAuditAction.UPDATE,
          table: isPvk ? EObjectType.PVK_DOKUMENT : EObjectType.ETTERLEVELSE_DOKUMENTASJON,
          tableId: isPvk ? pvkDokumentId : dokumentasjonId,
          time: data.historikk.pvkDokument.changeStamp.lastModifiedDate,
          user: data.historikk.pvkDokument.changeStamp.lastModifiedBy,
          deleteMessage: '',
          data: isPvk
            ? { pvkDokumentData: data.historikk.pvkDokument }
            : { etterlevelseDokumentasjonData: data.historikk.dokumentasjon },
        }
        await route.fulfill({ json: [audit] })
        return
      }
      if (path.startsWith('/team/resource/search/')) {
        await route.fulfill({ json: mockPage(resource ? [resource] : []) })
        return
      }
      if (path.startsWith('/team/search/')) {
        await route.fulfill({ json: mockPage(team ? [team] : []) })
        return
      }
      if (path.startsWith('/krav/search/')) {
        const search = path.slice('/krav/search/'.length).toLowerCase()
        await route.fulfill({
          json: mockPage(
            data.krav.filter((krav) =>
              `${krav.kravNummer} ${krav.navn}`.toLowerCase().includes(search)
            )
          ),
        })
        return
      }
    }

    if (
      (method === 'PUT' && path === `/pvkdokument/${pvkDokumentId}`) ||
      (method === 'PUT' && path === `/pvkdokument/godkjenning/${pvkDokumentId}`) ||
      (method === 'POST' && path === '/pvkdokument')
    ) {
      const dto: Omit<Partial<IPvkDokument>, 'ytterligereEgenskaper'> & {
        ytterligereEgenskaper: string[]
      } = request.postDataJSON()
      const egenskaper = data.codelists.codelist[EListName.YTTERLIGERE_EGENSKAPER]
      expect(
        dto.ytterligereEgenskaper.every((value) => egenskaper.some((code) => code.code === value))
      ).toBe(true)
      data.pvkDokument = updated(data.pvkDokument, {
        ...dto,
        id: pvkDokumentId,
        ytterligereEgenskaper: egenskaper.filter((code) =>
          dto.ytterligereEgenskaper.includes(code.code)
        ),
      })
      if (path === `/pvkdokument/godkjenning/${pvkDokumentId}`) {
        expect(data.pvkDokument.status).toBe(EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER)
        data.historikk = structuredClone({
          dokumentasjon: data.dokumentasjon,
          pvkDokument: data.pvkDokument,
          behandlingensLivslop: data.behandlingensLivslop,
          artOgOmfang: data.artOgOmfang,
          risikoscenarioer: data.risikoscenarioer,
          tiltak: data.tiltak,
          pvoTilbakemelding: data.pvoTilbakemelding,
        })
      }
      await route.fulfill({ json: data.pvkDokument })
      return
    }
    if (
      (method === 'POST' && path === '/behandlingens-art-og-omfang') ||
      (method === 'PUT' && path === `/behandlingens-art-og-omfang/${data.artOgOmfang.id}`)
    ) {
      const dto: Partial<IBehandlingensArtOgOmfang> = request.postDataJSON()
      data.artOgOmfang = updated(data.artOgOmfang, dto)
      await route.fulfill({ json: data.artOgOmfang })
      return
    }
    if (
      (method === 'POST' && path === '/behandlingenslivslop') ||
      (method === 'PUT' && path === `/behandlingenslivslop/${data.behandlingensLivslop.id}`)
    ) {
      const multipart = await request.frame().evaluate(async () => {
        const mockWindow = window as typeof window & { __pvkMultipartRequests?: FormData[] }
        const formData = mockWindow.__pvkMultipartRequests?.shift()
        if (!formData) {
          throw new Error('Livsløpsforespørselen må ha en multipart-kropp')
        }
        const part = formData.get('request')
        if (!(part instanceof Blob)) {
          throw new Error('Livsløpsforespørselen må inneholde en JSON-fil med navn request')
        }
        const dto: Partial<IBehandlingensLivslop> = JSON.parse(await part.text())
        const files = await Promise.all(
          formData.getAll('filer').map(async (file) => {
            if (typeof file === 'string') {
              throw new Error('Livsløpsvedlegg må være filer')
            }
            return {
              name: file.name,
              type: file.type,
              bytes: Array.from(new Uint8Array(await file.arrayBuffer())),
            }
          })
        )
        return { dto, files }
      })
      const dto = multipart.dto
      const filer = multipart.files.map((file) => ({
        filnavn: file.name,
        filtype: file.type,
        fil: Buffer.from(file.bytes).toString('base64'),
      }))
      data.behandlingensLivslop = updated(data.behandlingensLivslop, { ...dto, filer })
      await route.fulfill({ json: data.behandlingensLivslop })
      return
    }
    if (
      (method === 'POST' && path === '/pvotilbakemelding') ||
      (method === 'PUT' && path === `/pvotilbakemelding/${data.pvoTilbakemelding.id}`)
    ) {
      const dto: Partial<IPvoTilbakemelding> = request.postDataJSON()
      data.pvoTilbakemelding = updated(data.pvoTilbakemelding, dto)
      await route.fulfill({ json: data.pvoTilbakemelding })
      return
    }
    if (method === 'POST' && path === '/p360/arkiver') {
      expect(url.searchParams.get('etterlevelseDokumentasjonId')).toBe(dokumentasjonId)
      await route.fulfill({ json: data.dokumentasjon })
      return
    }

    const risikoMatch = path.match(/^\/risikoscenario\/([^/]+)$/)
    if (method === 'POST' && path === '/risikoscenario') {
      const dto: Partial<IRisikoscenario> = request.postDataJSON()
      const created = mapRisikoscenarioToFormValue({
        ...dto,
        id: `ny-risiko-${nextId++}`,
        changeStamp: data.pvkDokument.changeStamp,
      })
      created.version = 1
      data.risikoscenarioer.push(created)
      await route.fulfill({ json: created })
      return
    }
    if (risikoMatch && ['GET', 'PUT', 'DELETE'].includes(method)) {
      const current = data.risikoscenarioer.find(({ id }) => id === risikoMatch[1])
      if (!current) {
        await notFound(route)
        return
      }
      if (method === 'DELETE') {
        data.risikoscenarioer = data.risikoscenarioer.filter(({ id }) => id !== current.id)
        data.tiltak.forEach((tiltak) => {
          tiltak.risikoscenarioIds = tiltak.risikoscenarioIds.filter((id) => id !== current.id)
        })
      }
      let response = current
      if (method === 'PUT') {
        const dto: Partial<IRisikoscenario> = request.postDataJSON()
        response = updated(current, dto)
        data.risikoscenarioer = data.risikoscenarioer.map((risiko) =>
          risiko.id === current.id ? response : risiko
        )
      }
      await route.fulfill({ json: response })
      return
    }
    if (method === 'PUT' && path === '/risikoscenario/update/addRelevanteTiltak') {
      const dto: ITiltakRisikoscenarioRelasjon = request.postDataJSON()
      const risiko = data.risikoscenarioer.find(({ id }) => id === dto.risikoscenarioId)
      if (!risiko || dto.tiltakIds.some((id) => !data.tiltak.some((tiltak) => tiltak.id === id))) {
        await notFound(route)
        return
      }
      risiko.tiltakIds = [...new Set([...risiko.tiltakIds, ...dto.tiltakIds])]
      data.tiltak
        .filter(({ id }) => dto.tiltakIds.includes(id))
        .forEach((tiltak) => {
          tiltak.risikoscenarioIds = [...new Set([...tiltak.risikoscenarioIds, risiko.id])]
        })
      await route.fulfill({ json: risiko })
      return
    }
    if (method === 'PUT' && path === '/risikoscenario/update/addRelevantKrav') {
      const dto: IKravRisikoscenarioRelasjon = request.postDataJSON()
      const krav = data.krav.find(({ kravNummer }) => kravNummer === dto.kravnummer)
      const scenarioer = data.risikoscenarioer.filter(({ id }) =>
        dto.risikoscenarioIder.includes(id)
      )
      if (!krav || scenarioer.length !== dto.risikoscenarioIder.length) {
        await notFound(route)
        return
      }
      scenarioer.forEach((risiko) => {
        if (!risiko.relevanteKravNummer.some(({ kravNummer }) => kravNummer === krav.kravNummer)) {
          risiko.relevanteKravNummer.push({
            kravNummer: krav.kravNummer,
            kravVersjon: krav.kravVersjon,
            navn: krav.navn,
            temaCode: 'PVK',
          })
        }
      })
      await route.fulfill({ json: scenarioer })
      return
    }
    const removeKrav = path.match(/^\/risikoscenario\/([^/]+)\/removeKrav\/(\d+)$/)
    if (method === 'PUT' && removeKrav) {
      const risiko = data.risikoscenarioer.find(({ id }) => id === removeKrav[1])
      if (!risiko) {
        await notFound(route)
        return
      }
      risiko.relevanteKravNummer = risiko.relevanteKravNummer.filter(
        ({ kravNummer }) => kravNummer !== Number(removeKrav[2])
      )
      await route.fulfill({ json: risiko })
      return
    }
    const removeTiltak = path.match(/^\/risikoscenario\/([^/]+)\/removeTiltak\/([^/]+)$/)
    if (method === 'PUT' && removeTiltak) {
      const risiko = data.risikoscenarioer.find(({ id }) => id === removeTiltak[1])
      const tiltak = data.tiltak.find(({ id }) => id === removeTiltak[2])
      if (!risiko || !tiltak) {
        await notFound(route)
        return
      }
      risiko.tiltakIds = risiko.tiltakIds.filter((id) => id !== tiltak.id)
      tiltak.risikoscenarioIds = tiltak.risikoscenarioIds.filter((id) => id !== risiko.id)
      await route.fulfill({ json: risiko })
      return
    }

    const createTiltak = path.match(/^\/tiltak\/risikoscenario\/([^/]+)$/)
    const tiltakMatch = path.match(/^\/tiltak\/([^/]+)$/)
    if ((method === 'POST' && createTiltak) || (method === 'PUT' && tiltakMatch)) {
      const dto: Omit<Partial<ITiltak>, 'ansvarlig' | 'ansvarligTeam'> & {
        ansvarlig: string
        ansvarligTeam: string
      } = request.postDataJSON()
      const current = data.tiltak.find(({ id }) => id === tiltakMatch?.[1])
      const risiko = data.risikoscenarioer.find(({ id }) => id === createTiltak?.[1])
      if ((method === 'PUT' && !current) || (method === 'POST' && !risiko)) {
        await notFound(route)
        return
      }
      expect(!dto.ansvarlig || dto.ansvarlig === resource?.navIdent).toBe(true)
      expect(!dto.ansvarligTeam || dto.ansvarligTeam === team?.id).toBe(true)
      const mapped = mapTiltakToFormValue({
        ...current,
        ...dto,
        id: current?.id || `ny-tiltak-${nextId++}`,
        changeStamp: current?.changeStamp || data.pvkDokument.changeStamp,
        ansvarlig: dto.ansvarlig ? resource : undefined,
        ansvarligTeam: dto.ansvarligTeam ? team : undefined,
        risikoscenarioIds: current?.risikoscenarioIds || (risiko ? [risiko.id] : []),
      })
      const saved = current ? updated(current, mapped) : { ...mapped, version: 1 }
      data.tiltak = [...data.tiltak.filter(({ id }) => id !== saved.id), saved]
      if (risiko) {
        risiko.tiltakIds.push(saved.id)
      }
      await route.fulfill({ json: saved })
      return
    }
    if (tiltakMatch && ['GET', 'DELETE'].includes(method)) {
      const current = data.tiltak.find(({ id }) => id === tiltakMatch[1])
      if (!current) {
        await notFound(route)
        return
      }
      if (method === 'DELETE') {
        data.tiltak = data.tiltak.filter(({ id }) => id !== current.id)
        data.risikoscenarioer.forEach((risiko) => {
          risiko.tiltakIds = risiko.tiltakIds.filter((id) => id !== current.id)
        })
      }
      await route.fulfill({ json: current })
      return
    }
    await route.fallback()
  })
}

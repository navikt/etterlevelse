'use client'

import {
  getDashboardAvdelingStats,
  getDashboardTableByAvdeling,
} from '@/api/dashboard/dashboardApi'
import { getEnheterBySeksjonId } from '@/api/nom/nomApi'
import { DashboardBarCard } from '@/components/dashboard/DashboardBarCard'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StickyHorizontalScroll } from '@/components/dashboard/StickyHorizontalScroll'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IDashboardDetailResponse,
  IDashboardTable,
} from '@/constants/dashboard/dashboardConstants'
import { EEtterlevelseDokumentasjonStatus } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  EPvkVurdering,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IOrgEnhet } from '@/constants/teamkatalogen/teamkatalogConstants'
import { getPollyBaseUrl } from '@/util/behandling/behandlingUtil'
import { getEtterlevelseDokumentStatusText } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { handleSort } from '@/util/handleTableSort'
import {
  DownloadIcon,
  ExclamationmarkTriangleFillIcon,
  InformationSquareIcon,
} from '@navikt/aksel-icons'
import {
  BodyShort,
  Button,
  Chips,
  Heading,
  InfoCard,
  Link,
  List,
  LocalAlert,
  Popover,
  ReadMore,
  Select,
  SortState,
  Table,
  Tabs,
  UNSAFE_Combobox,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'
import { AvdelingDetailReadMore } from './DashboardReadmore/AvdelingDetailReadMore'

interface IProps {
  avdelingId: string
}

const getBehovForPvkText = (
  pvkVurdering: EPvkVurdering,
  behandlerPersonopplysninger: boolean
): string => {
  if (!behandlerPersonopplysninger) return 'Behandler ikke personopplysninger'
  if (!pvkVurdering || pvkVurdering === EPvkVurdering.UNDEFINED) return 'Ikke vurdert behov'
  if (pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return 'Skal ikke gjennomføre PVK'
  if (pvkVurdering === EPvkVurdering.SKAL_UTFORE) return 'Skal gjennomføre PVK'
  if (pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) return 'PVK i Word'
  return 'Ikke vurdert behov'
}

const getPvkOnlyStatusText = (
  pvkVurdering: EPvkVurdering,
  pvkStatus: EPvkDokumentStatus,
  hasPvkDocumentationStarted: boolean
): string => {
  if (!pvkVurdering || pvkVurdering === EPvkVurdering.UNDEFINED) return '-'
  if (pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE) return '-'
  if (pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT) return '-'
  if (!hasPvkDocumentationStarted) return 'Ikke påbegynt'
  if (pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER) return 'Godkjent av risikoeier'
  if (pvkStatus === EPvkDokumentStatus.TRENGER_GODKJENNING) return 'Sendt til risikoeier'
  if (
    pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO ||
    pvkStatus === EPvkDokumentStatus.PVO_UNDERARBEID ||
    pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
  )
    return 'Til behandling hos PVO'
  if (
    pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO ||
    pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID
  )
    return 'Tilbakemelding fra PVO'
  return 'Under arbeid'
}

const getKravTrafficColor = (ferdig: number, total: number): string => {
  if (total === 0) return '#C6C2BF'
  const pct = (ferdig / total) * 100
  if (pct >= 100) return '#06893A'
  if (pct >= 50) return '#E67E22'
  return '#C30000'
}

const TrafficDot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: 6,
      verticalAlign: 'middle',
    }}
  />
)

const OppfyltCell = ({ dok }: { dok: IDashboardTable }) => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const oppfylt = dok.antallSuksesskriterierOppfylt ?? 0
  const ikkeOppfylt = dok.antallSuksesskriterierIkkeOppfylt ?? 0
  const totSuksess = oppfylt + ikkeOppfylt
  const oppfyltPct = dok.oppfyltKravProsent

  return (
    <>
      <button
        ref={setAnchorEl}
        onClick={() => setOpen((o) => !o)}
        style={{
          border: '2.5px solid #0067C5',
          borderRadius: '10px',
          padding: '4px 12px',
          background: 'white',
          color: '#0067C5',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          minWidth: '52px',
        }}
      >
        {oppfyltPct != null ? `${oppfyltPct}%` : '-'}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorEl={anchorEl} placement='bottom'>
        <Popover.Content>
          <div style={{ width: '340px' }}>
            {totSuksess > 0 ? (
              <>
                <div className='flex w-full h-6 mb-4 overflow-hidden'>
                  <div style={{ flex: oppfylt, backgroundColor: '#005B4B' }} />
                  <div style={{ flex: ikkeOppfylt, backgroundColor: '#C30000' }} />
                </div>
                <div className='flex items-center gap-2 mb-2'>
                  <span
                    className='inline-block w-4 h-4 rounded-full'
                    style={{ backgroundColor: '#005B4B' }}
                  />
                  <BodyShort>
                    Oppfylt <strong>{oppfylt} suksesskriterier</strong>
                  </BodyShort>
                </div>
                <div className='flex items-center gap-2 mb-6'>
                  <span
                    className='inline-block w-4 h-4 rounded-full'
                    style={{ backgroundColor: '#C30000' }}
                  />
                  <BodyShort>
                    Ikke oppfylt <strong>{ikkeOppfylt} suksesskriterier</strong>
                  </BodyShort>
                </div>
                <hr className='my-4' />
                <BodyShort className='mb-2' style={{ textAlign: 'left' }}>
                  <strong>Oppfylt der kravet er ferdig vurdert: {oppfyltPct}%</strong>
                </BodyShort>
                <BodyShort
                  size='small'
                  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  Etterleveren må først ha markert hele kravet som ferdig utfylt for at tallene
                  vises her. Prosentandelen er beregnet basert på forholdet mellom suksesskriterier
                  vurdert som oppfylt, og suksesskriterier vurdert som ikke oppfylt. Det tas ikke
                  med suksesskriterier som ble vurdert som ikke relevant.
                </BodyShort>
              </>
            ) : (
              <BodyShort>Ingen suksesskriterier ferdig vurdert ennå.</BodyShort>
            )}
          </div>
        </Popover.Content>
      </Popover>
    </>
  )
}

const AvdelingDetailPage = ({ avdelingId }: IProps) => {
  const [data, setData] = useState<IDashboardDetailResponse>()
  const [tableData, settableData] = useState<IDashboardTable[]>()
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [selectedEnhet, setSelectedEnhet] = useState<string>('')
  const [enhetOptions, setEnhetOptions] = useState<IOrgEnhet[]>([])
  const [tableTab, setTableTab] = useState('dok_pvk')
  const [sort, setSort] = useState<SortState | undefined>()
  const [searchFilters, setSearchFilters] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      await getDashboardAvdelingStats(avdelingId)
        .then((response) => {
          response.statsBySeksjon = new Map(Object.entries(response.statsBySeksjon ?? {}))
          setData(response)
        })
        .finally(() => setIsLoading(false))

      await getDashboardTableByAvdeling(avdelingId)
        .then(settableData)
        .finally(() => setIsTableLoading(false))
    })()
  }, [avdelingId])

  useEffect(() => {
    const promise =
      selectedSeksjon && selectedSeksjon !== 'ingen-seksjon'
        ? getEnheterBySeksjonId(selectedSeksjon)
        : Promise.resolve([])
    promise
      .then((result) => {
        setEnhetOptions(result)
        setSelectedEnhet('')
      })
      .catch(() => {
        setEnhetOptions([])
        setSelectedEnhet('')
      })
  }, [selectedSeksjon])

  const getSearchableText = (dok: IDashboardTable): string => {
    return [
      `E${dok.etterlevelseNummer} ${dok.etterlevelseDokumentasjonTittel}`,
      dok.teamsData?.map((t) => t.name)?.join(' ') ?? '',
      dok.resourcesData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.risikoeiereData?.map((r) => r.fullName)?.join(' ') ?? '',
      dok.behandlinger?.map((b) => `B${b.nummer} ${b.navn}`)?.join(' ') ?? '',
      dok.ikkePaabegynt
        ? 'Ikke påbegynt'
        : getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus),
      getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger),
      getPvkOnlyStatusText(dok.pvkVurdering, dok.pvkStatus, dok.hasPvkDocumentationStarted),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
  }

  const addSearchFilter = (term: string) => {
    const trimmed = term.trim()
    if (trimmed && !searchFilters.includes(trimmed)) {
      setSearchFilters((prev) => [...prev, trimmed])
    }
  }

  const removeSearchFilter = (term: string) => {
    setSearchFilters((prev) => prev.filter((f) => f !== term))
  }

  const getFilteredDoks = (): IDashboardTable[] => {
    if (tableData) {
      let filtered: IDashboardTable[]
      if (selectedSeksjon === 'ingen-seksjon') {
        filtered = tableData.filter(
          (etterlevelseDokTableValue) => !etterlevelseDokTableValue.seksjoner?.length
        )
      } else if (selectedSeksjon) {
        filtered = tableData.filter((etterlevelseDokTableValue) =>
          etterlevelseDokTableValue.seksjoner.map((s) => s.nomSeksjonId).includes(selectedSeksjon)
        )
      } else {
        filtered = tableData
      }

      if (selectedEnhet) {
        filtered = filtered.filter((dok) =>
          dok.enheter?.some((e) => e.nomEnhetId === selectedEnhet)
        )
      }

      return filtered
    } else {
      return []
    }
  }

  const sortedDoks = useMemo(() => {
    let filtered = getFilteredDoks()

    if (searchFilters.length > 0) {
      filtered = filtered.filter((dok) => {
        const text = getSearchableText(dok)
        return searchFilters.some((filter) => text.includes(filter.toLowerCase()))
      })
    }

    if (!sort) {
      return filtered
    }

    const dir = sort.direction === 'ascending' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const getValue = (dok: typeof a): string | number => {
        switch (sort.orderBy) {
          case 'dok':
            return `E${dok.etterlevelseNummer} ${dok.etterlevelseDokumentasjonTittel}`
          case 'team':
            return dok.teamsData?.map((teamsData) => teamsData.name).join(', ') || ''
          case 'person':
            return dok.resourcesData?.map((resource) => resource.fullName).join(', ') || ''
          case 'risikoeier':
            return dok.risikoeiereData?.map((risikoeier) => risikoeier.fullName).join(', ') || ''
          case 'seksjon':
            return dok.seksjoner?.map((s) => s.nomSeksjonName).join(', ') || ''
          case 'enhet':
            return dok.enheter?.map((e) => e.nomEnhetName).join(', ') || ''
          case 'etterlevelse':
            return dok.ikkePaabegynt
              ? 'Ikke påbegynt'
              : getEtterlevelseDokumentStatusText(dok.etterlevelseDokumentasjonStatus)
          case 'behovForPvk':
            return getBehovForPvkText(dok.pvkVurdering, dok.behandlerPersonopplysninger)
          case 'pvkStatus':
            return getPvkOnlyStatusText(
              dok.pvkVurdering,
              dok.pvkStatus,
              dok.hasPvkDocumentationStarted
            )
          case 'dato_etterlvelse':
            return dok.sistOppdatertEtterlevelse || ''
          case 'dato_godkjent':
            return dok.sistGodkjentEtterlevelse || ''
          case 'dato_pvk':
            return dok.sistOppdatertPvk || ''
          case 'dato_godkjent_pvk':
            return dok.sistGodkjentPvk || ''
          case 'behandlinger':
            return dok.behandlinger?.map((b) => b.navn).join(', ') || ''
          case 'krav':
            return dok.antallOppfyltKrav || 0
          case 'oppfylt': {
            return dok.oppfyltKravProsent && dok.oppfyltKravProsent > 0 ? dok.oppfyltKravProsent : 0
          }
          case 'antallScenarioer':
            return dok.antallRisikoscenario || 0
          case 'hoyRisiko':
            return dok.antallHoyRisikoscenario || 0
          case 'hoyRisikoEtterTiltak':
            return dok.antallHoyRisikoEtterTiltak || 0
          case 'antallTiltak':
            return dok.antallTiltak || 0
          case 'ikkeIverksatte':
            return dok.antallIkkeIverksattTiltak || 0
          case 'fristPassert':
            return dok.antallTiltakFristPassert || 0
          default:
            return ''
        }
      }
      const aVal = getValue(a)
      const bVal = getValue(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }, [sort, tableData, selectedSeksjon, selectedEnhet, searchFilters])

  const hasEnheter = useMemo(() => {
    return tableData?.some((dok) => dok.enheter && dok.enheter.length > 0) ?? false
  }, [tableData])

  if (isLoading || data == null) {
    return (
      <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
        <CenteredLoader />
      </PageLayout>
    )
  }

  const getCurrentStats = (): IAvdelingDashboardStats => {
    if (selectedSeksjon && data.statsBySeksjon.has(selectedSeksjon)) {
      return data.statsBySeksjon.get(selectedSeksjon)!
    } else {
      return data
    }
  }

  const computeStatsFromDoks = (doks: IDashboardTable[]): IAvdelingDashboardStats => {
    const total = doks.length
    const ikkePaabegynt = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
        d.ikkePaabegynt === true
    ).length
    const underArbeid = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus === EEtterlevelseDokumentasjonStatus.UNDER_ARBEID &&
        !d.ikkePaabegynt
    ).length
    const sendtTilGodkjenning = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus ===
        EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
    ).length
    const godkjent = doks.filter(
      (d) =>
        d.etterlevelseDokumentasjonStatus ===
        EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER
    ).length

    const medPersonopplysninger = doks.filter((d) => d.behandlerPersonopplysninger)
    const ikkeVurdertBehov = medPersonopplysninger.filter(
      (d) => !d.pvkVurdering || d.pvkVurdering === EPvkVurdering.UNDEFINED
    ).length
    const vurdertIkkeBehov = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.SKAL_IKKE_UTFORE
    ).length
    const behovIkkePaabegynt = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.SKAL_UTFORE
    ).length
    const pvkIWord = medPersonopplysninger.filter(
      (d) => d.pvkVurdering === EPvkVurdering.ALLEREDE_UTFORT
    ).length

    const skalUtfore = doks.filter((d) => d.pvkVurdering === EPvkVurdering.SKAL_UTFORE)
    const pvkIkkePaabegynt = skalUtfore.filter((d) => !d.hasPvkDocumentationStarted).length
    const pvkGodkjent = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted && d.pvkStatus === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER
    ).length
    const pvkTilBehandling = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO ||
          d.pvkStatus === EPvkDokumentStatus.PVO_UNDERARBEID ||
          d.pvkStatus === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
    ).length
    const pvkTilbakemelding = skalUtfore.filter(
      (d) =>
        d.hasPvkDocumentationStarted &&
        (d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO ||
          d.pvkStatus === EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID)
    ).length
    const pvkUnderArbeid =
      skalUtfore.filter((d) => d.hasPvkDocumentationStarted).length -
      pvkGodkjent -
      pvkTilBehandling -
      pvkTilbakemelding

    const baseStats = getCurrentStats()

    return {
      ...baseStats,
      dokumenter: {
        total,
        ikkePaabegynt,
        underArbeid,
        sendtTilGodkjenning,
        godkjentAvRisikoeier: godkjent,
      },
      suksesskriterier: {
        total: 0,
        ikkePaabegyntAntall: 0,
        underArbeidAntall: 0,
        oppfyltAntall: 0,
        ikkeOppfyltAntall: 0,
        ikkeRelevantAntall: 0,
        ikkePaabegyntProsent: 0,
        underArbeidProsent: 0,
        oppfyltProsent: 0,
        ikkeOppfyltProsent: 0,
        ikkeRelevantProsent: 0,
      },
      behovForPvk: {
        totalMedPersonopplysninger: medPersonopplysninger.length,
        ikkeVurdertBehov,
        vurdertIkkeBehov,
        behovIkkePaabegynt,
      },
      pvk: {
        total: skalUtfore.length + pvkIWord,
        ikkePaabegynt: pvkIkkePaabegynt,
        underArbeid: pvkUnderArbeid,
        tilBehandlingHosPvo: pvkTilBehandling,
        tilbakemeldingFraPvo: pvkTilbakemelding,
        godkjentAvRisikoeier: pvkGodkjent,
        pvkIWord,
      },
    }
  }

  const getDisplayStats = (): IAvdelingDashboardStats => {
    if (searchFilters.length > 0 || selectedEnhet) {
      return computeStatsFromDoks(sortedDoks)
    }
    return getCurrentStats()
  }

  return (
    <PageLayout
      pageTitle={data ? data.avdelingNavn : ''}
      currentPage={data ? data.avdelingNavn : ''}
      breadcrumbPaths={[{ href: '/dashboard', pathName: 'Dashboard' }]}
    >
      <div className='mt-4'>
        <Heading size='large' level='1'>
          {data.avdelingNavn}
        </Heading>
      </div>

      <ReadMore header='Hvordan bruker jeg denne siden?' className='mt-4 mb-4 max-w-[75ch]'>
        <p>På denne siden kan du:</p>
        <List className='mt-4'>
          <List.Item>
            Se figurer og lese nøkkeltall om avdelingens nåværende etterlevelser og
            personvernkonsekvensvurderinger (PVK-er).
          </List.Item>
          <List.Item>
            Utforske nærmere i tabeller, hvilke etterlevelser og PVK-er som finnes, hvem de
            tilhører, etterlevelsens nåværende tilstand, med mer.
          </List.Item>
          <List.Item>
            Søke og filtrere i datasettet: du kan finne seksjon, team, risikoeier, dokumentnavn, med
            flere. Du kan også sortere tabellene, for eksempel etter teamnavn.
          </List.Item>
        </List>
        <p className='mt-4'>
          For mer detaljer anbefaler vi informasjonssidene{' '}
          <Link href='/omstottetiletterlevelse' target='_blank'>
            Om Støtte til etterlevelse
          </Link>
          ,{' '}
          <Link href='/om-pvk' target='_blank'>
            Om Digital PVK
          </Link>{' '}
          og{' '}
          <Link href='/om-behandlingskatalogen' target='_blank'>
            Om Behandlingskatalogen
          </Link>
          .
        </p>
      </ReadMore>

      {avdelingId === 'ingen-avdeling' && (
        <LocalAlert status='warning' className='mt-4 mb-4' aria-live='off'>
          <LocalAlert.Header>
            <LocalAlert.Title as='h2'>
              Disse etterlevelsesdokumentene mangler avdeling og/eller seksjon
            </LocalAlert.Title>
          </LocalAlert.Header>
          <LocalAlert.Content>
            <ul>
              <li>
                Det er viktig at alle oppdaterer informasjon om avdeling og seksjon i
                etterlevelsesdokumentene sine.
              </li>
              <li>
                Dersom du oppdager etterlevelsesdokumenter som ikke er aktuelle lenger, ta kontakt
                med Team Datajegerne på #etterlevelse på slack.
              </li>
            </ul>
          </LocalAlert.Content>
        </LocalAlert>
      )}

      <div className='rounded-lg px-6 py-4' style={{ backgroundColor: '#e3eff7' }}>
        <div className='flex gap-4 flex-wrap items-end'>
          {data.seksjoner && data.seksjoner.length > 0 && (
            <>
              <Select
                label='Velg seksjon'
                className='mt-4 w-fit min-w-64'
                value={selectedSeksjon}
                onChange={(e) => setSelectedSeksjon(e.target.value)}
              >
                <option value=''>Alle seksjoner</option>
                {data.seksjoner
                  .filter((s) => s.navn !== data.avdelingNavn)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.navn}
                    </option>
                  ))}
              </Select>

              {selectedSeksjon &&
                selectedSeksjon !== 'ingen-seksjon' &&
                enhetOptions.length > 0 && (
                  <Select
                    label='Velg enhet'
                    className='mt-4 w-fit min-w-64'
                    value={selectedEnhet}
                    onChange={(e) => setSelectedEnhet(e.target.value)}
                  >
                    <option value=''>Alle enheter</option>
                    {[...enhetOptions]
                      .sort((a, b) => a.navn.localeCompare(b.navn))
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.navn}
                        </option>
                      ))}
                    <option value='ingen-enhet'>Ikke valgt enhet</option>
                  </Select>
                )}
            </>
          )}
        </div>

        <div className='flex flex-col md:flex-row md:items-end gap-4 mt-4'>
          <UNSAFE_Combobox
            label='Søk etter team, personer eller dokumentnavn'
            description='Trykk Enter for å legge til søkeord. Du kan velge flere.'
            options={[]}
            allowNewValues
            isMultiSelect
            value={searchValue}
            onChange={(val) => setSearchValue(val)}
            onClear={() => setSearchValue('')}
            selectedOptions={searchFilters}
            shouldShowSelectedOptions={false}
            onToggleSelected={(option, isSelected) => {
              if (isSelected) {
                addSearchFilter(option)
                setSearchValue('')
              } else {
                removeSearchFilter(option)
              }
            }}
            className='flex-1'
          />
          <Button
            variant='tertiary'
            size='small'
            icon={<DownloadIcon aria-hidden />}
            onClick={() => {
              const stats = getDisplayStats()
              const BOM = '\uFEFF'
              const seksjonNavn =
                selectedSeksjon === 'ingen-seksjon'
                  ? 'Ikke valgt seksjon'
                  : data.seksjoner?.find((s) => s.id === selectedSeksjon)?.navn
              const enhetNavn =
                selectedEnhet === 'ingen-enhet'
                  ? 'Ikke valgt enhet'
                  : enhetOptions.find((e) => e.id === selectedEnhet)?.navn
              const filterLines = [
                `Avdeling;${data.avdelingNavn}`,
                `Seksjon;${seksjonNavn || 'Alle seksjoner'}`,
                ...(enhetOptions.length > 0 ? [`Enhet;${enhetNavn || 'Alle enheter'}`] : []),
                ...(searchFilters.length > 0 ? [`Søkefilter;${searchFilters.join(', ')}`] : []),
                '',
              ]
              const header = [
                'Etterlevelsesdokumenter totalt',
                'Ikke påbegynt',
                'Under arbeid',
                'Sendt til godkjenning',
                'Godkjent',
                'Suksesskriterier - ikke påbegynt %',
                'Suksesskriterier - under arbeid %',
                'Suksesskriterier - oppfylt %',
                'Suksesskriterier - ikke oppfylt %',
                'Suksesskriterier - ikke relevant %',
                'Vurdere behov for PVK - totalt med personopplysninger',
                'Ikke vurdert behov',
                'Skal ikke gjennomføre PVK',
                'Skal gjennomføre PVK',
                'PVK i Word',
                'Digital PVK totalt',
                'Ikke påbegynt',
                'Under arbeid',
                'Til behandling hos PVO',
                'Tilbakemelding fra PVO',
                'Godkjent av risikoeier',
              ].join(';')
              const row = [
                stats.dokumenter.total,
                stats.dokumenter.ikkePaabegynt,
                stats.dokumenter.underArbeid,
                stats.dokumenter.sendtTilGodkjenning,
                stats.dokumenter.godkjentAvRisikoeier,
                stats.suksesskriterier.ikkePaabegyntProsent,
                stats.suksesskriterier.underArbeidProsent,
                stats.suksesskriterier.oppfyltProsent,
                stats.suksesskriterier.ikkeOppfyltProsent,
                stats.suksesskriterier.ikkeRelevantProsent,
                stats.behovForPvk.totalMedPersonopplysninger,
                stats.behovForPvk.ikkeVurdertBehov,
                stats.behovForPvk.vurdertIkkeBehov,
                stats.behovForPvk.behovIkkePaabegynt,
                stats.pvk.pvkIWord,
                stats.pvk.total - stats.pvk.pvkIWord,
                stats.pvk.ikkePaabegynt,
                stats.pvk.underArbeid,
                stats.pvk.tilBehandlingHosPvo,
                stats.pvk.tilbakemeldingFraPvo,
                stats.pvk.godkjentAvRisikoeier,
              ].join(';')
              const csv = BOM + [...filterLines, header, row].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `nokkeltall-${data.avdelingNavn}-${new Date().toISOString().slice(0, 10)}.csv`
              link.click()
              URL.revokeObjectURL(url)
            }}
          >
            Last ned nøkkeltallutvalg som CSV
          </Button>
        </div>

        {searchFilters.length > 0 && (
          <Chips className='mt-4'>
            {searchFilters.map((filter) => (
              <Chips.Removable key={filter} onDelete={() => removeSearchFilter(filter)}>
                {filter}
              </Chips.Removable>
            ))}
          </Chips>
        )}

        {!isTableLoading &&
          sortedDoks.length === 0 &&
          (searchFilters.length > 0 || !!selectedSeksjon || !!selectedEnhet) && (
            <InfoCard data-color='warning' className='mt-4 max-w-[75ch]'>
              <InfoCard.Header icon={<ExclamationmarkTriangleFillIcon aria-hidden />}>
                <InfoCard.Title as='h3'>Filtrering har ført til 0 treff</InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>Prøv å fjerne et av filtervalgene dine.</InfoCard.Content>
            </InfoCard>
          )}

        {selectedSeksjon === 'ingen-seksjon' && (
          <LocalAlert status='warning' className='mt-4' aria-live='off'>
            <LocalAlert.Header>
              <LocalAlert.Title as='h2'>
                Disse etterlevelsesdokumentene mangler avdeling og/eller seksjon
              </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
              <ul>
                <li>
                  Det er viktig at alle oppdaterer informasjon om avdeling og seksjon i
                  etterlevelsesdokumentene sine.
                </li>
                <li>
                  Dersom du oppdager etterlevelsesdokumenter som ikke er aktuelle lenger, ta kontakt
                  med Team Datajegerne på #etterlevelse på slack.
                </li>
              </ul>
            </LocalAlert.Content>
          </LocalAlert>
        )}
      </div>

      <Heading size='medium' level='2' className='mt-6'>
        Oversikt
      </Heading>

      <Tabs className='mt-4' defaultValue='figurer'>
        <Tabs.List>
          <Tabs.Tab value='figurer' label='Vis figurer' />
          <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
        </Tabs.List>
        <Tabs.Panel value='figurer'>
          <div className='mt-6'>
            <DashboardBarCard stats={getDisplayStats()} hideHeader />
            <AvdelingDetailReadMore />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='nokkeltall'>
          <div className='mt-6'>
            <DashboardCard stats={getDisplayStats()} hideHeader />
            <AvdelingDetailReadMore />
          </div>
        </Tabs.Panel>
      </Tabs>

      {!isTableLoading && tableData && (
        <>
          <Heading size='medium' level='2' className='mt-10'>
            Detaljert om etterlevelse
          </Heading>
        </>
      )}

      <div className='dashboard-full-width-breakout'>
        {isTableLoading && <CenteredLoader />}

        {!isTableLoading && tableData && (
          <>
            <Tabs
              value={tableTab}
              onChange={(val) => {
                setTableTab(val)
                setSort(undefined)
              }}
              className='mt-4'
            >
              <Tabs.List>
                <Tabs.Tab value='dok_pvk' label='Dokumentasjonsoversikt' />
                <Tabs.Tab value='krav' label='Etterlevelse' />
                <Tabs.Tab value='pvk' label='Digital PVK' />
              </Tabs.List>
              <Tabs.Panel value='dok_pvk'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Savner du noen etterlevelser i tabellen?</strong>
                        <br />
                        Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre
                        som er valgt øverst i siden, eller se i{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt
                          (åpner i en ny fane)
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='etterlevelse'>
                          Etterlevelse
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behovForPvk'>
                          Vurdere behov for PVK
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='pvkStatus'>
                          Digital PVK status
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behandlinger'>
                          <span className='flex flex-col'>
                            <span>Behandlinger</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='seksjon'>
                          Seksjon
                        </Table.ColumnHeader>
                        {hasEnheter && (
                          <Table.ColumnHeader sortable sortKey='enhet'>
                            Enhet
                          </Table.ColumnHeader>
                        )}
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.ikkePaabegynt
                                ? 'Ikke p\u00e5begynt'
                                : getEtterlevelseDokumentStatusText(
                                    dok.etterlevelseDokumentasjonStatus
                                  )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getBehovForPvkText(
                                dok.pvkVurdering,
                                dok.behandlerPersonopplysninger
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getPvkOnlyStatusText(
                                dok.pvkVurdering,
                                dok.pvkStatus,
                                dok.hasPvkDocumentationStarted
                              )}
                            </Table.DataCell>
                            <Table.DataCell className='dashboard-cell-wide'>
                              {dok.behandlinger?.map((b) => (
                                <div key={b.id}>
                                  <Link
                                    href={`${getPollyBaseUrl()}process/${b.id}`}
                                    target='_blank'
                                  >
                                    B{b.nummer} {b.navn}
                                  </Link>
                                </div>
                              )) || '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.seksjoner?.length
                                ? dok.seksjoner.map((s) => (
                                    <div key={s.nomSeksjonId}>{s.nomSeksjonName}</div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            {hasEnheter && (
                              <Table.DataCell>
                                {dok.enheter?.length
                                  ? dok.enheter.map((e) => (
                                      <div key={e.nomEnhetId}>{e.nomEnhetName}</div>
                                    ))
                                  : '-'}
                              </Table.DataCell>
                            )}
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
                {sortedDoks.length === 0 && (
                  <BodyShort className='mt-4 text-gray-500'>Ingen treff på valgte filtre</BodyShort>
                )}
              </Tabs.Panel>

              <Tabs.Panel value='krav'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Hvordan tolke &quot;Antall krav ferdig utfylt&quot;?</strong>
                        <br />
                        Første tall viser hvor mange etterlevelseskrav som etterleveren har satt til
                        &quot;ferdig utfylt&quot;. Andre tall viser totalantall krav som
                        etterleveren må besvare i sitt etterlevelsesdokument. Ulike
                        etterlevelsesdokumenter inneholder ulike antall krav basert på hvilke
                        egenskaper som gjelder for dokumentet.
                      </List.Item>
                      <List.Item>
                        <strong>Hva betyr “Oppfylt”?</strong>
                        <br />I denne kolonna kan du klikke på prosentandel og finne mer
                        informasjon. Etterleveren må først ha markert hele kravet som ferdig utfylt
                        for at tallene blir tatt med her. Prosentandelen er beregnet basert på
                        forholdet mellom suksesskriterier vurdert som oppfylt, og suksesskriterier
                        vurdert som ikke oppfylt. Det tas ikke med suksesskriterier som ble vurdert
                        som ikke relevant.
                      </List.Item>
                      <List.Item>
                        <strong>Savner du noen etterlevelser i tabellen?</strong>
                        <br />
                        Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre
                        som er valgt øverst i siden, eller se i{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt
                          (åpner i en ny fane)
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='krav' align='center'>
                          Antall krav ferdig utfylt
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='oppfylt' align='center'>
                          Oppfylt
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_etterlvelse'>
                          Sist oppdatert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_godkjent'>
                          Sist godkjent
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              <TrafficDot
                                color={getKravTrafficColor(
                                  dok.antallOppfyltKrav || 0,
                                  dok.antallKrav || 0
                                )}
                              />
                              {dok.antallOppfyltKrav} av {dok.antallKrav}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              <OppfyltCell dok={dok} />
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistOppdatertEtterlevelse
                                ? moment(dok.sistOppdatertEtterlevelse).format('D. MMMM YYYY')
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistGodkjentEtterlevelse
                                ? moment(dok.sistGodkjentEtterlevelse).format('D. MMMM YYYY')
                                : 'Aldri godkjent'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
                {sortedDoks.length === 0 && (
                  <BodyShort className='mt-4 text-gray-500'>Ingen treff på valgte filtre</BodyShort>
                )}
              </Tabs.Panel>

              <Tabs.Panel value='pvk'>
                <div style={{ maxWidth: '75ch' }}>
                  <ReadMore header='Hvordan bruker jeg denne tabellen?' className='mt-4 mb-4'>
                    <List>
                      <List.Item>
                        <strong>Du kan bla bortover i tabellen</strong>
                        <br />
                        Med mindre du bruker en veldig stor skjerm, er det sannsynligvis flere
                        kolonner bortover til høyre som du kanskje ikke har sett.
                      </List.Item>
                      <List.Item>
                        <strong>Du kan sortere tabellen etter kolonne</strong>
                        <br />
                        Ved å klikke på øverste rad i tabellen kan du velge om du vil sortere etter
                        kolonnenavnet. Dette kan gjøre det enklere å finne informasjonen du lurer
                        på.
                      </List.Item>
                      <List.Item>
                        <strong>Hva vil det si å vurdere behov for PVK?</strong>
                        <br />I Støtte til etterlevelse er det mulig å gå inn og registrere at man
                        har vurdert behov for PVK, og hva som ble konklusjonen. Muligheten vises for
                        alle etterlevere som har valgt “Behandler personopplysninger” som egenskap i
                        etterlevelsesdokumentet sitt. Det er viktig at vurderingen om behov for PVK
                        registreres, uansett konklusjon, slik at Nav har oversikt.{' '}
                        <Link
                          href='/om-pvk#beslutningsstotte'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Les mer om beslutningsstøtte ved vurdering av behov for PVK (åpner i en ny
                          fane).
                        </Link>
                      </List.Item>
                      <List.Item>
                        <strong>Har vi statistikk om PVK i Word?</strong>
                        <br />
                        Vi har ikke statistikk om PVK i Word annet enn hva man registrerer under
                        vurdering av behov for PVK. Her er det mulig å velge “Vi har en tidligere
                        godkjent PVK i Word”. Etter hvert som PVK-en skal oppdateres og sendes til
                        personvernombudet på nytt, skal etterleveren gå over til å bruke Digital
                        PVK. Antall PVK i Word vil dermed senke med tiden, og statistikk om PVK bli
                        mer detaljert når flere PVK-er ligger i ny løsning.
                      </List.Item>
                      <List.Item>
                        <strong>Jeg savner PVK-er i tabellen</strong>
                        <br />
                        Hvis du savner en viss PVK i listen, er det fordi etterleveren ikke har
                        valgt avdeling eller seksjon når de har opprettet etterlevelsesdokumentet
                        sitt. PVK-en er koblet på etterlevelsesdokumentet i løsningen.{' '}
                        <Link
                          href='/dashboard/ingen-avdeling'
                          target='_blank'
                          style={{ display: 'inline' }}
                        >
                          Se på listen over etterlevelsesdokumenter der avdeling/seksjon ikke er
                          valgt (åpner i en ny fane).
                        </Link>
                      </List.Item>
                    </List>
                  </ReadMore>
                </div>
                <StickyHorizontalScroll>
                  <Table
                    className='mt-4 dashboard-table'
                    size='small'
                    zebraStripes
                    stickyHeader
                    sort={sort}
                    onSortChange={(sortKey) => handleSort(sort, setSort, sortKey)}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader sortable sortKey='dok'>
                          <span className='flex flex-col'>
                            <span>Etterlevelsesdokument</span>
                            <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                          </span>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='behovForPvk'>
                          Vurdere behov for PVK
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='pvkStatus'>
                          Digital PVK status
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='antallScenarioer' align='center'>
                          Antall risikoscenarioer
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='hoyRisiko' align='center'>
                          Høy risiko før tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='hoyRisikoEtterTiltak' align='center'>
                          Høy risiko etter tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='antallTiltak' align='center'>
                          Antall tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='ikkeIverksatte' align='center'>
                          Ikke iverksatte tiltak
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='fristPassert' align='center'>
                          Tiltaksfrist passert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_pvk'>
                          Sist oppdatert
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='dato_godkjent_pvk'>
                          Sist godkjent
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='risikoeier'>
                          Risikoeier
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='team'>
                          Team
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey='person'>
                          Person
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedDoks.map((dok) => {
                        return (
                          <Table.Row key={dok.etterlevelseDokumentasjonId}>
                            <Table.DataCell className='dashboard-cell-wide'>
                              <Link
                                href={`/dokumentasjon/${dok.etterlevelseDokumentasjonId}`}
                                target='_blank'
                              >
                                E{dok.etterlevelseNummer}.{dok.etterlevelseDokumentVersjon}{' '}
                                {dok.etterlevelseDokumentasjonTittel}
                              </Link>
                            </Table.DataCell>
                            <Table.DataCell>
                              {getBehovForPvkText(
                                dok.pvkVurdering,
                                dok.behandlerPersonopplysninger
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {getPvkOnlyStatusText(
                                dok.pvkVurdering,
                                dok.pvkStatus,
                                dok.hasPvkDocumentationStarted
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallRisikoscenario ? dok.antallRisikoscenario : '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallHoyRisikoscenario ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallHoyRisikoscenario}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallHoyRisikoEtterTiltak ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallHoyRisikoEtterTiltak}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallTiltak ?? '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallIkkeIverksattTiltak ? dok.antallIkkeIverksattTiltak : '-'}
                            </Table.DataCell>
                            <Table.DataCell align='center'>
                              {dok.antallTiltakFristPassert ? (
                                <span className='inline-flex items-center'>
                                  <TrafficDot color='#C30000' />
                                  {dok.antallTiltakFristPassert}
                                </span>
                              ) : (
                                '-'
                              )}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistOppdatertPvk
                                ? moment(dok.sistOppdatertPvk).format('D. MMMM YYYY')
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.sistGodkjentPvk
                                ? moment(dok.sistGodkjentPvk).format('D. MMMM YYYY')
                                : 'Aldri godkjent'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.risikoeiereData && dok.risikoeiereData.length > 0
                                ? dok.risikoeiereData.map((risikoeier, index) => (
                                    <div key={`${risikoeier.navIdent}-${index}`}>
                                      {risikoeier.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.teamsData && dok.teamsData.length > 0
                                ? dok.teamsData.map((team) => <div key={team.id}>{team.name}</div>)
                                : '-'}
                            </Table.DataCell>
                            <Table.DataCell>
                              {dok.resourcesData && dok.resourcesData.length > 0
                                ? dok.resourcesData.map((resource, index) => (
                                    <div key={`${resource.navIdent}-${index}`}>
                                      {resource.fullName}
                                    </div>
                                  ))
                                : '-'}
                            </Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                </StickyHorizontalScroll>
                {sortedDoks.length === 0 && (
                  <BodyShort className='mt-4 text-gray-500'>Ingen treff på valgte filtre</BodyShort>
                )}
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </div>

      {!isTableLoading && (
        <InfoCard data-color='info' className='mt-8'>
          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
            <InfoCard.Title as='h2'>
              Savner du noe, eller har du tilbakemelding til oss?
            </InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Hvis du savner et visst etterlevelsesdokument i listen, sjekk hvilke filtre som er valgt
            i søkefeltet, eller se{' '}
            <Link href='/dashboard/ingen-avdeling' target='_blank'>
              listen over etterlevelsesdokumenter der avdeling/seksjon ikke er valgt (åpner i en ny
              fane)
            </Link>
            . Hvis du har andre tilbakemeldinger om dashboards, bli med på #etterlevelse på Slack,
            eller send mail til teamdatajegerne@nav.no.
          </InfoCard.Content>
        </InfoCard>
      )}
    </PageLayout>
  )
}

export default AvdelingDetailPage

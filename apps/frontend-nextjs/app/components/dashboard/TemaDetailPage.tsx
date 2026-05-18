'use client'

import {
  getDashboardAvdelingStats,
  getDashboardStats,
  getKravDashboardStats,
  getTemaDashboardStats,
} from '@/api/dashboard/dashboardApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { StickyHorizontalScroll } from '@/components/dashboard/StickyHorizontalScroll'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import {
  IAvdelingDashboardStats,
  IKravDashboardStats,
  ISeksjonOption,
  ITemaDashboardStats,
} from '@/constants/dashboard/dashboardConstants'
import { handleSort } from '@/util/handleTableSort'
import { DownloadIcon } from '@navikt/aksel-icons'
import {
  BodyShort,
  Button,
  Detail,
  Heading,
  Link,
  LocalAlert,
  Select,
  SortState,
  Table,
  Tabs,
} from '@navikt/ds-react'
import { useEffect, useMemo, useState } from 'react'
import {
  IBarSegment,
  KRAV_COLORS,
  SUKSESS_COLORS,
  formatPct,
  roundedPercentages,
} from './chartUtils'

interface IProps {
  temaCode: string
}

const RechartsStackedBar = ({
  data,
  showPercentage,
  percentageOnly,
}: {
  data: IBarSegment[]
  showPercentage?: boolean
  percentageOnly?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const pcts = roundedPercentages(data.map((d) => d.value))

  return (
    <div style={{ marginTop: '12px', maxWidth: '500px' }}>
      <div style={{ display: 'flex', height: 32, borderRadius: 4, overflow: 'hidden' }}>
        {data
          .filter((d) => d.value > 0)
          .map((d) => (
            <div
              key={d.name}
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: d.color,
                transition: 'width 0.3s',
              }}
            />
          ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />
            <BodyShort size='small'>
              {d.name}{' '}
              <strong>
                {percentageOnly
                  ? `${formatPct(pcts[i], d.value)}%`
                  : `${d.value}${showPercentage ? ` (${formatPct(pcts[i], d.value)}%)` : ''}`}
              </strong>
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}

const KravStatsCard = ({ krav }: { krav: IKravDashboardStats }) => {
  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: krav.antallUnderArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: krav.antallFerdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: krav.antallSuksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    { name: 'Oppfylt', value: krav.antallSuksesskriterierOppfylt, color: SUKSESS_COLORS.oppfylt },
    {
      name: 'Ikke oppfylt',
      value: krav.antallSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: krav.antallSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ferdigSuksessData: IBarSegment[] = [
    {
      name: 'Oppfylt',
      value: krav.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value: krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ikkeFerdigSuksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: krav.antallSuksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    {
      name: 'Oppfylt',
      value:
        krav.antallSuksesskriterierOppfylt - krav.antallFerdigUtfyltKravSuksesskriterierOppfylt,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value:
        krav.antallSuksesskriterierIkkeOppfylt -
        krav.antallFerdigUtfyltKravSuksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value:
        krav.antallSuksesskriterierIkkeRelevant -
        krav.antallFerdigUtfyltKravSuksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Heading size='small' level='3'>
        {krav.kravNavn}
      </Heading>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Gjennomføringsstatus (krav) ({krav.etterlevelseTotal})
          </Heading>
          <RechartsStackedBar data={kravData} showPercentage />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Etterlevelse (suksesskriterier)
          </Heading>
          <RechartsStackedBar data={suksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Suksesskriterier der kravet er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ferdigSuksessData} percentageOnly />
        </div>

        <div>
          <Heading size='xsmall' level='4' className='min-h-12'>
            Suksesskriterier der kravet ikke er ferdig utfylt
          </Heading>
          <RechartsStackedBar data={ikkeFerdigSuksessData} percentageOnly />
        </div>
      </div>
    </div>
  )
}

const exportKravToCsv = (kravStats: IKravDashboardStats[], temaName: string) => {
  const BOM = '\uFEFF'
  const header = [
    'Krav',
    'Gjennomføringsstatus (krav)',
    'Under arbeid',
    'Ferdig vurdert',
    'Suksesskriterier under arbeid',
    'Suksesskriterier oppfylt',
    'Suksesskriterier ikke oppfylt',
    'Suksesskriterier ikke relevant',
  ].join(';')

  const rows = kravStats.map((k) =>
    [
      k.kravNavn,
      k.etterlevelseTotal,
      k.antallUnderArbeid,
      k.antallFerdigVurdert,
      k.antallSuksesskriterierUnderArbeid,
      k.antallSuksesskriterierOppfylt,
      k.antallSuksesskriterierIkkeOppfylt,
      k.antallSuksesskriterierIkkeRelevant,
    ].join(';')
  )

  const csv = BOM + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `krav-${temaName}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const TemaDetailPage = ({ temaCode }: IProps) => {
  const [temaStats, setTemaStats] = useState<ITemaDashboardStats | null>(null)
  const [kravStats, setKravStats] = useState<IKravDashboardStats[]>([])
  const [avdelinger, setAvdelinger] = useState<IAvdelingDashboardStats[]>([])
  const [seksjoner, setSeksjoner] = useState<ISeksjonOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isKravLoading, setIsKravLoading] = useState(true)
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')
  const [selectedKrav, setSelectedKrav] = useState<string>('')
  const [sort, setSort] = useState<SortState | undefined>()

  useEffect(() => {
    getDashboardStats()
      .then(setAvdelinger)
      .catch((err) => console.error('Failed to fetch avdelinger:', err))
  }, [])

  useEffect(() => {
    setIsLoading(true)
    getTemaDashboardStats(selectedAvdeling || undefined, selectedSeksjon || undefined)
      .then((data) => {
        const tema = data.find((t) => t.temaCode === temaCode)
        setTemaStats(tema || null)
      })
      .catch((err) => console.error('Failed to fetch tema stats:', err))
      .finally(() => setIsLoading(false))
  }, [temaCode, selectedAvdeling, selectedSeksjon])

  useEffect(() => {
    setIsKravLoading(true)
    getKravDashboardStats(temaCode, selectedAvdeling || undefined, selectedSeksjon || undefined)
      .then(setKravStats)
      .catch((err) => console.error('Failed to fetch krav stats:', err))
      .finally(() => setIsKravLoading(false))
  }, [temaCode, selectedAvdeling, selectedSeksjon])

  useEffect(() => {
    if (selectedAvdeling) {
      getDashboardAvdelingStats(selectedAvdeling)
        .then((data) => setSeksjoner(data.seksjoner || []))
        .catch(() => setSeksjoner([]))
    } else {
      setSeksjoner([])
    }
  }, [selectedAvdeling])

  const filteredKrav = useMemo(() => {
    if (!kravStats) return []
    if (selectedKrav) return kravStats.filter((k) => k.kravId === selectedKrav)
    return kravStats
  }, [kravStats, selectedKrav])

  const sortedKrav = useMemo(() => {
    if (!sort || !filteredKrav) return filteredKrav

    const dir = sort.direction === 'ascending' ? 1 : -1
    return [...filteredKrav].sort((a, b) => {
      const getValue = (krav: IKravDashboardStats): string | number => {
        switch (sort.orderBy) {
          case 'krav':
            return krav.kravNavn
          case 'etterlevelse':
            return krav.etterlevelseTotal
          case 'underArbeid':
            return krav.antallUnderArbeid
          case 'ferdigVurdert':
            return krav.antallFerdigVurdert
          case 'suksessOppfylt':
            return krav.antallSuksesskriterierOppfylt
          case 'suksessIkkeOppfylt':
            return krav.antallSuksesskriterierIkkeOppfylt
          case 'suksessIkkeRelevant':
            return krav.antallSuksesskriterierIkkeRelevant
          default:
            return ''
        }
      }
      const aVal = getValue(a)
      const bVal = getValue(b)
      if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir
      return String(aVal).localeCompare(String(bVal)) * dir
    })
  }, [sort, filteredKrav])

  if (isLoading && !temaStats) {
    return (
      <PageLayout pageTitle='Dashboard' currentPage='Dashboard' breadcrumbPaths={[]}>
        <CenteredLoader />
      </PageLayout>
    )
  }

  const temaName = temaStats?.temaName || temaCode

  const kravData: IBarSegment[] = temaStats
    ? [
        { name: 'Under arbeid', value: temaStats.kravUnderArbeid, color: KRAV_COLORS.underArbeid },
        {
          name: 'Ferdig vurdert',
          value: temaStats.kravFerdigVurdert,
          color: KRAV_COLORS.ferdigVurdert,
        },
      ]
    : []

  const suksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Under arbeid',
          value: temaStats.suksesskriterierUnderArbeid,
          color: SUKSESS_COLORS.underArbeid,
        },
        {
          name: 'Oppfylt',
          value: temaStats.suksesskriterierOppfylt,
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value: temaStats.suksesskriterierIkkeOppfylt,
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value: temaStats.suksesskriterierIkkeRelevant,
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  const ferdigSuksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Oppfylt',
          value: temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value: temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value: temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  const ikkeFerdigSuksessData: IBarSegment[] = temaStats
    ? [
        {
          name: 'Under arbeid',
          value: temaStats.suksesskriterierUnderArbeid,
          color: SUKSESS_COLORS.underArbeid,
        },
        {
          name: 'Oppfylt',
          value:
            temaStats.suksesskriterierOppfylt -
            (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
          color: SUKSESS_COLORS.oppfylt,
        },
        {
          name: 'Ikke oppfylt',
          value:
            temaStats.suksesskriterierIkkeOppfylt -
            (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
          color: SUKSESS_COLORS.ikkeOppfylt,
        },
        {
          name: 'Ikke relevant',
          value:
            temaStats.suksesskriterierIkkeRelevant -
            (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
          color: SUKSESS_COLORS.ikkeRelevant,
        },
      ]
    : []

  return (
    <PageLayout
      pageTitle={`Tema: ${temaName}`}
      currentPage={temaName}
      breadcrumbPaths={[
        { href: '/dashboard', pathName: 'Dashboard' },
        { href: '/dashboard/tema', pathName: 'Tema' },
      ]}
    >
      <div className='mt-4'>
        <Heading size='large' level='1'>
          Tema: {temaName}
        </Heading>
      </div>

      <LocalAlert status='announcement' className='mt-4' aria-live='off'>
        <LocalAlert.Header>
          <LocalAlert.Title as='h2'>
            Obs! Disse sidene er fortsatt under utvikling.
          </LocalAlert.Title>
        </LocalAlert.Header>
        <LocalAlert.Content>
          Dersom dere finner feil eller har forslag til forbedringer, ta kontakt på #etterlevelse på
          slack.
        </LocalAlert.Content>
      </LocalAlert>

      <Heading size='medium' level='2' className='mt-4'>
        Overordnet for temaet
      </Heading>

      <div className='grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-4 mt-4 sm:items-end'>
        <Select
          label='Filtrer etter avdeling'
          className='sm:w-fit sm:min-w-64'
          style={{ width: '100%' }}
          value={selectedAvdeling}
          onChange={(e) => {
            setSelectedAvdeling(e.target.value)
            setSelectedSeksjon('')
            if (!e.target.value) {
              setSeksjoner([])
            }
          }}
        >
          <option value=''>Alle avdelinger</option>
          {avdelinger.map((a) => (
            <option key={a.avdelingId} value={a.avdelingId}>
              {a.avdelingNavn}
            </option>
          ))}
        </Select>

        {(() => {
          const avdelingNavn = avdelinger.find(
            (a) => a.avdelingId === selectedAvdeling
          )?.avdelingNavn
          const filteredSeksjoner = seksjoner.filter(
            (s) => s.navn !== avdelingNavn && s.id !== 'ingen-seksjon'
          )
          return selectedAvdeling && filteredSeksjoner.length > 0 ? (
            <Select
              label='Filtrer etter seksjon'
              className='sm:w-fit sm:min-w-64'
              style={{ width: '100%' }}
              value={selectedSeksjon}
              onChange={(e) => setSelectedSeksjon(e.target.value)}
            >
              <option value=''>Alle seksjoner</option>
              {filteredSeksjoner.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.navn}
                </option>
              ))}
            </Select>
          ) : null
        })()}
      </div>

      {temaStats && (
        <Tabs className='mt-4' defaultValue='figurer'>
          <Tabs.List>
            <Tabs.Tab value='figurer' label='Vis figurer' />
            <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
          </Tabs.List>
          <Tabs.Panel value='figurer'>
            <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
              <Detail uppercase className='mb-4'>
                {(temaStats.etterlevelseDokumentCount ?? 0).toLocaleString('nb-NO')}{' '}
                ETTERLEVELSESDOKUMENTER
              </Detail>
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
                <div>
                  <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                    Vurdering av etterlevelseskrav
                  </Heading>
                  <RechartsStackedBar data={kravData} percentageOnly />
                </div>
                <div>
                  <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                    Etterlevelse: suksesskriterier
                  </Heading>
                  <RechartsStackedBar data={suksessData} percentageOnly />
                </div>
                <div>
                  <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                    Suksesskriterier der kravet er ferdig utfylt
                  </Heading>
                  <RechartsStackedBar data={ferdigSuksessData} percentageOnly />
                </div>
                <div>
                  <Heading size='xsmall' level='3' className='min-h-[3rem]'>
                    Suksesskriterier der kravet ikke er ferdig utfylt
                  </Heading>
                  <RechartsStackedBar data={ikkeFerdigSuksessData} percentageOnly />
                </div>
              </div>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value='nokkeltall'>
            <div className='border border-gray-300 rounded-lg p-6 bg-white mt-6'>
              <Detail uppercase className='mb-4'>
                {(temaStats.etterlevelseDokumentCount ?? 0).toLocaleString('nb-NO')}{' '}
                ETTERLEVELSESDOKUMENTER
              </Detail>
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4'>
                <div>
                  {(() => {
                    const kravPcts = roundedPercentages([
                      temaStats.kravUnderArbeid,
                      temaStats.kravFerdigVurdert,
                    ])
                    return (
                      <>
                        <BodyShort weight='semibold' className='mb-2'>
                          Gjennomføringsstatus: krav ({temaStats.kravTotal})
                        </BodyShort>
                        <BodyShort>
                          Under arbeid{' '}
                          <span className='font-bold'>{temaStats.kravUnderArbeid}</span>
                          {temaStats.kravTotal > 0 &&
                            ` (${formatPct(kravPcts[0], temaStats.kravUnderArbeid)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ferdig vurdert{' '}
                          <span className='font-bold'>{temaStats.kravFerdigVurdert}</span>
                          {temaStats.kravTotal > 0 &&
                            ` (${formatPct(kravPcts[1], temaStats.kravFerdigVurdert)}%)`}
                        </BodyShort>
                      </>
                    )
                  })()}
                </div>
                <div>
                  {(() => {
                    const totalSuksess =
                      temaStats.suksesskriterierUnderArbeid +
                      temaStats.suksesskriterierOppfylt +
                      temaStats.suksesskriterierIkkeOppfylt +
                      temaStats.suksesskriterierIkkeRelevant
                    const sukPcts = roundedPercentages([
                      temaStats.suksesskriterierUnderArbeid,
                      temaStats.suksesskriterierOppfylt,
                      temaStats.suksesskriterierIkkeOppfylt,
                      temaStats.suksesskriterierIkkeRelevant,
                    ])
                    return (
                      <>
                        <BodyShort weight='semibold' className='mb-2'>
                          Etterlevelse: suksesskriterier ({totalSuksess})
                        </BodyShort>
                        <BodyShort>
                          Under arbeid{' '}
                          <span className='font-bold'>{temaStats.suksesskriterierUnderArbeid}</span>
                          {totalSuksess > 0 &&
                            ` (${formatPct(sukPcts[0], temaStats.suksesskriterierUnderArbeid)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Oppfylt{' '}
                          <span className='font-bold'>{temaStats.suksesskriterierOppfylt}</span>
                          {totalSuksess > 0 &&
                            ` (${formatPct(sukPcts[1], temaStats.suksesskriterierOppfylt)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke oppfylt{' '}
                          <span className='font-bold'>{temaStats.suksesskriterierIkkeOppfylt}</span>
                          {totalSuksess > 0 &&
                            ` (${formatPct(sukPcts[2], temaStats.suksesskriterierIkkeOppfylt)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke relevant{' '}
                          <span className='font-bold'>
                            {temaStats.suksesskriterierIkkeRelevant}
                          </span>
                          {totalSuksess > 0 &&
                            ` (${formatPct(sukPcts[3], temaStats.suksesskriterierIkkeRelevant)}%)`}
                        </BodyShort>
                      </>
                    )
                  })()}
                </div>
                <div>
                  {(() => {
                    const totalFerdig =
                      (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0) +
                      (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0) +
                      (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)
                    const ferdigPcts = roundedPercentages([
                      temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0,
                      temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0,
                      temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0,
                    ])
                    return (
                      <>
                        <BodyShort weight='semibold' className='mb-2'>
                          Suksesskriterier der kravet er ferdig utfylt ({totalFerdig})
                        </BodyShort>
                        <BodyShort>
                          Oppfylt{' '}
                          <span className='font-bold'>
                            {temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0}
                          </span>
                          {totalFerdig > 0 &&
                            ` (${formatPct(ferdigPcts[0], temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke oppfylt{' '}
                          <span className='font-bold'>
                            {temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0}
                          </span>
                          {totalFerdig > 0 &&
                            ` (${formatPct(ferdigPcts[1], temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke relevant{' '}
                          <span className='font-bold'>
                            {temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0}
                          </span>
                          {totalFerdig > 0 &&
                            ` (${formatPct(ferdigPcts[2], temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)}%)`}
                        </BodyShort>
                      </>
                    )
                  })()}
                </div>
                <div>
                  {(() => {
                    const ikkeFerdigUnderArbeid = temaStats.suksesskriterierUnderArbeid
                    const ikkeFerdigOppfylt =
                      temaStats.suksesskriterierOppfylt -
                      (temaStats.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0)
                    const ikkeFerdigIkkeOppfylt =
                      temaStats.suksesskriterierIkkeOppfylt -
                      (temaStats.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0)
                    const ikkeFerdigIkkeRelevant =
                      temaStats.suksesskriterierIkkeRelevant -
                      (temaStats.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0)
                    const totalIkkeFerdig =
                      ikkeFerdigUnderArbeid +
                      ikkeFerdigOppfylt +
                      ikkeFerdigIkkeOppfylt +
                      ikkeFerdigIkkeRelevant
                    const ikkeFerdigPcts = roundedPercentages([
                      ikkeFerdigUnderArbeid,
                      ikkeFerdigOppfylt,
                      ikkeFerdigIkkeOppfylt,
                      ikkeFerdigIkkeRelevant,
                    ])
                    return (
                      <>
                        <BodyShort weight='semibold' className='mb-2'>
                          Suksesskriterier der kravet ikke er ferdig utfylt ({totalIkkeFerdig})
                        </BodyShort>
                        <BodyShort>
                          Under arbeid <span className='font-bold'>{ikkeFerdigUnderArbeid}</span>
                          {totalIkkeFerdig > 0 &&
                            ` (${formatPct(ikkeFerdigPcts[0], ikkeFerdigUnderArbeid)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Oppfylt <span className='font-bold'>{ikkeFerdigOppfylt}</span>
                          {totalIkkeFerdig > 0 &&
                            ` (${formatPct(ikkeFerdigPcts[1], ikkeFerdigOppfylt)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke oppfylt <span className='font-bold'>{ikkeFerdigIkkeOppfylt}</span>
                          {totalIkkeFerdig > 0 &&
                            ` (${formatPct(ikkeFerdigPcts[2], ikkeFerdigIkkeOppfylt)}%)`}
                        </BodyShort>
                        <BodyShort>
                          Ikke relevant <span className='font-bold'>{ikkeFerdigIkkeRelevant}</span>
                          {totalIkkeFerdig > 0 &&
                            ` (${formatPct(ikkeFerdigPcts[3], ikkeFerdigIkkeRelevant)}%)`}
                        </BodyShort>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      )}

      <Heading size='medium' level='2' className='mt-10'>
        Krav tilknyttet {temaName}
      </Heading>

      <div className='grid grid-cols-1 sm:flex sm:flex-row sm:flex-wrap gap-4 mt-4 sm:items-end'>
        <Select
          label='Velg krav'
          className='sm:w-fit sm:min-w-64'
          style={{ width: '100%' }}
          value={selectedKrav}
          onChange={(e) => setSelectedKrav(e.target.value)}
        >
          <option value=''>Alle krav</option>
          {kravStats.map((k) => (
            <option key={k.kravId} value={k.kravId}>
              {k.kravNavn}
            </option>
          ))}
        </Select>

        <Select
          label='Filtrer etter avdeling'
          className='sm:w-fit sm:min-w-64'
          style={{ width: '100%' }}
          value={selectedAvdeling}
          onChange={(e) => {
            setSelectedAvdeling(e.target.value)
            setSelectedSeksjon('')
            if (!e.target.value) {
              setSeksjoner([])
            }
          }}
        >
          <option value=''>Alle avdelinger</option>
          {avdelinger.map((a) => (
            <option key={a.avdelingId} value={a.avdelingId}>
              {a.avdelingNavn}
            </option>
          ))}
        </Select>

        {(() => {
          const avdelingNavn = avdelinger.find(
            (a) => a.avdelingId === selectedAvdeling
          )?.avdelingNavn
          const filteredSeksjoner = seksjoner.filter(
            (s) => s.navn !== avdelingNavn && s.id !== 'ingen-seksjon'
          )
          return selectedAvdeling && filteredSeksjoner.length > 0 ? (
            <Select
              label='Filtrer etter seksjon'
              className='sm:w-fit sm:min-w-64'
              style={{ width: '100%' }}
              value={selectedSeksjon}
              onChange={(e) => setSelectedSeksjon(e.target.value)}
            >
              <option value=''>Alle seksjoner</option>
              {filteredSeksjoner.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.navn}
                </option>
              ))}
            </Select>
          ) : null
        })()}

        <Button
          variant='tertiary'
          size='small'
          icon={<DownloadIcon aria-hidden />}
          onClick={() => exportKravToCsv(filteredKrav, temaName)}
          disabled={isKravLoading || filteredKrav.length === 0}
          className='ml-auto pr-4'
        >
          Last ned utvalg som CSV
        </Button>
      </div>

      {isKravLoading && <CenteredLoader />}

      {!isKravLoading && (
        <Tabs className='mt-4' defaultValue='figurer'>
          <Tabs.List>
            <Tabs.Tab value='figurer' label='Vis figurer' />
            <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
          </Tabs.List>
          <Tabs.Panel value='figurer'>
            <div className='flex flex-col gap-6 mt-6'>
              {sortedKrav.map((krav) => (
                <KravStatsCard key={krav.kravId} krav={krav} />
              ))}
              {sortedKrav.length === 0 && (
                <BodyShort className='text-gray-500'>Ingen krav for dette temaet</BodyShort>
              )}
            </div>
          </Tabs.Panel>
          <Tabs.Panel value='nokkeltall'>
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
                    <Table.ColumnHeader sortable sortKey='krav'>
                      <span className='flex flex-col'>
                        <span>Krav</span>
                        <span className='font-normal'>(Lenker åpnes i ny fane)</span>
                      </span>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey='etterlevelse' align='center'>
                      Gjennomføringsstatus (krav)
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey='underArbeid' align='center'>
                      Under arbeid
                    </Table.ColumnHeader>
                    <Table.ColumnHeader sortable sortKey='ferdigVurdert' align='center'>
                      Ferdig vurdert
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedKrav.map((krav) => (
                    <Table.Row key={krav.kravId}>
                      <Table.DataCell className='dashboard-cell-wide'>
                        <Link href={`/krav/${krav.kravNummer}/${krav.kravVersjon}`} target='_blank'>
                          {krav.kravNavn}
                        </Link>
                      </Table.DataCell>
                      <Table.DataCell align='center'>{krav.etterlevelseTotal}</Table.DataCell>
                      <Table.DataCell align='center'>{krav.antallUnderArbeid}</Table.DataCell>
                      <Table.DataCell align='center'>{krav.antallFerdigVurdert}</Table.DataCell>
                    </Table.Row>
                  ))}
                  {sortedKrav.length === 0 && (
                    <Table.Row>
                      <Table.DataCell colSpan={4}>
                        <BodyShort className='text-gray-500'>Ingen krav for dette temaet</BodyShort>
                      </Table.DataCell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </StickyHorizontalScroll>
          </Tabs.Panel>
        </Tabs>
      )}
    </PageLayout>
  )
}

export default TemaDetailPage

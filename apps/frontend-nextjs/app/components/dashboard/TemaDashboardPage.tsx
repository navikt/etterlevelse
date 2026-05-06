'use client'

import { getDashboardStats, getDashboardTableByAvdeling } from '@/api/dashboard/dashboardApi'
import {
  IEtterlevelseStatistikk,
  getAllEtterlevelseStatistikk,
} from '@/api/statistikk/statistikkApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IAvdelingDashboardStats, IDashboardTable } from '@/constants/dashboard/dashboardConstants'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { DownloadIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Heading, LocalAlert, Select, Tabs } from '@navikt/ds-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const KRAV_COLORS = {
  underArbeid: '#fa4d56',
  ferdigVurdert: '#005d5d',
}

const SUKSESS_COLORS = {
  underArbeid: '#1192e8',
  oppfylt: '#005d5d',
  ikkeOppfylt: '#fa4d56',
  ikkeRelevant: '#9f1853',
}

interface ITemaStats {
  temaCode: string
  temaName: string
  krav: {
    total: number
    underArbeid: number
    ferdigVurdert: number
  }
  suksesskriterier: {
    underArbeid: number
    oppfylt: number
    ikkeOppfylt: number
    ikkeRelevant: number
  }
}

const computeTemaStats = (
  data: IEtterlevelseStatistikk[],
  getTemaName: (code: string) => string
): ITemaStats[] => {
  const grouped = new Map<string, IEtterlevelseStatistikk[]>()

  data.forEach((record) => {
    if (!record.tema) return
    const existing = grouped.get(record.tema) || []
    existing.push(record)
    grouped.set(record.tema, existing)
  })

  const stats: ITemaStats[] = []

  grouped.forEach((records, temaCode) => {
    let underArbeid = 0
    let ferdigVurdert = 0
    let sUnderArbeid = 0
    let sOppfylt = 0
    let sIkkeOppfylt = 0
    let sIkkeRelevant = 0

    records.forEach((r) => {
      if (r.status === 'FERDIG_DOKUMENTERT' || r.status === 'IKKE_RELEVANT_FERDIG_DOKUMENTERT') {
        ferdigVurdert++
      } else {
        underArbeid++
      }

      sUnderArbeid += r.underArbeidSuksesskriterieIder.length
      sOppfylt += r.oppfyltSuksesskriterieIder.length
      sIkkeOppfylt += r.ikkeOppfyltSuksesskriterieIder.length
      sIkkeRelevant += r.ikkeRelevantSuksesskriterieIder.length
    })

    stats.push({
      temaCode,
      temaName: getTemaName(temaCode),
      krav: {
        total: underArbeid + ferdigVurdert,
        underArbeid,
        ferdigVurdert,
      },
      suksesskriterier: {
        underArbeid: sUnderArbeid,
        oppfylt: sOppfylt,
        ikkeOppfylt: sIkkeOppfylt,
        ikkeRelevant: sIkkeRelevant,
      },
    })
  })

  return stats.sort((a, b) => a.temaName.localeCompare(b.temaName, 'nb'))
}

interface IBarSegment {
  name: string
  value: number
  color: string
}

const RechartsStackedBar = ({
  data,
  showPercentage,
}: {
  data: IBarSegment[]
  showPercentage?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const chartData = [
    data.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {} as Record<string, number>),
  ]

  return (
    <div style={{ marginTop: '12px', maxWidth: '300px' }}>
      <ResponsiveContainer width='100%' height={32}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type='number' hide />
          <YAxis type='category' hide />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value)} (${Math.round((Number(value) / total) * 100)}%)`,
              String(name),
            ]}
          />
          {data
            .filter((d) => d.value > 0)
            .map((d) => (
              <Bar key={d.name} dataKey={d.name} stackId='stack' fill={d.color} />
            ))}
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        {data.map((d) => (
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
                {d.value}
                {showPercentage ? ` (${Math.round((d.value / total) * 100)}%)` : ''}
              </strong>
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}

const TemaStatsCard = ({ stats }: { stats: ITemaStats }) => {
  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: stats.krav.underArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: stats.krav.ferdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: stats.suksesskriterier.underArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    { name: 'Oppfylt', value: stats.suksesskriterier.oppfylt, color: SUKSESS_COLORS.oppfylt },
    {
      name: 'Ikke oppfylt',
      value: stats.suksesskriterier.ikkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: stats.suksesskriterier.ikkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const totalSuksess =
    stats.suksesskriterier.underArbeid +
    stats.suksesskriterier.oppfylt +
    stats.suksesskriterier.ikkeOppfylt +
    stats.suksesskriterier.ikkeRelevant

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Heading size='small' level='2'>
        {stats.temaName}
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '16px',
        }}
      >
        <div>
          <Heading size='xsmall' level='3'>
            Gjennomføringsstatus (krav) ({stats.krav.total})
          </Heading>
          <RechartsStackedBar data={kravData} showPercentage />
        </div>

        <div>
          <Heading size='xsmall' level='3'>
            Etterlevelse (suksesskriterier) ({totalSuksess})
          </Heading>
          <RechartsStackedBar data={suksessData} />
        </div>
      </div>
    </div>
  )
}

const TemaStatsKeyMetrics = ({ stats }: { stats: ITemaStats }) => {
  const totalSuksess =
    stats.suksesskriterier.underArbeid +
    stats.suksesskriterier.oppfylt +
    stats.suksesskriterier.ikkeOppfylt +
    stats.suksesskriterier.ikkeRelevant

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Heading size='small' level='2'>
        {stats.temaName}
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: '32px',
          rowGap: '16px',
          marginTop: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        <div>
          <BodyShort weight='semibold'>Gjennomføringsstatus (krav) ({stats.krav.total})</BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.krav.underArbeid}</span>
          </BodyShort>
          <BodyShort>
            Ferdig vurdert <span className='font-bold'>{stats.krav.ferdigVurdert}</span>
          </BodyShort>
        </div>

        <div>
          <BodyShort weight='semibold'>Etterlevelse (suksesskriterier) ({totalSuksess})</BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.suksesskriterier.underArbeid}</span>
          </BodyShort>
          <BodyShort>
            Oppfylt <span className='font-bold'>{stats.suksesskriterier.oppfylt}</span>
          </BodyShort>
          <BodyShort>
            Ikke oppfylt <span className='font-bold'>{stats.suksesskriterier.ikkeOppfylt}</span>
          </BodyShort>
          <BodyShort>
            Ikke relevant <span className='font-bold'>{stats.suksesskriterier.ikkeRelevant}</span>
          </BodyShort>
        </div>
      </div>
    </div>
  )
}

const exportToCsv = (stats: ITemaStats[]) => {
  const BOM = '\uFEFF'
  const header = [
    'Tema',
    'Krav totalt',
    'Krav under arbeid',
    'Krav ferdig vurdert',
    'Suksesskriterier under arbeid',
    'Suksesskriterier oppfylt',
    'Suksesskriterier ikke oppfylt',
    'Suksesskriterier ikke relevant',
  ].join(';')

  const rows = stats.map((s) =>
    [
      s.temaName,
      s.krav.total,
      s.krav.underArbeid,
      s.krav.ferdigVurdert,
      s.suksesskriterier.underArbeid,
      s.suksesskriterier.oppfylt,
      s.suksesskriterier.ikkeOppfylt,
      s.suksesskriterier.ikkeRelevant,
    ].join(';')
  )

  const csv = BOM + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `status-pr-tema-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const TemaDashboardPage = () => {
  const [statistikk, setStatistikk] = useState<IEtterlevelseStatistikk[]>([])
  const [avdelinger, setAvdelinger] = useState<IAvdelingDashboardStats[]>([])
  const [avdelingTables, setAvdelingTables] = useState<IDashboardTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTema, setSelectedTema] = useState<string>('')
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>('')
  const [selectedSeksjon, setSelectedSeksjon] = useState<string>('')

  const { utils } = useContext(CodelistContext)

  useEffect(() => {
    getDashboardStats()
      .then(setAvdelinger)
      .catch((err) => console.error('Failed to fetch avdelinger:', err))

    getAllEtterlevelseStatistikk()
      .then(setStatistikk)
      .catch((err) => console.error('Failed to fetch etterlevelse statistics:', err))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (selectedAvdeling) {
      getDashboardTableByAvdeling(selectedAvdeling).then(setAvdelingTables)
    } else {
      setAvdelingTables([])
      setSelectedSeksjon('')
    }
  }, [selectedAvdeling])

  const seksjoner = useMemo(() => {
    const map = new Map<string, string>()
    avdelingTables.forEach((t) =>
      t.seksjoner?.forEach((s) => map.set(s.nomSeksjonId, s.nomSeksjonName))
    )
    return Array.from(map, ([id, navn]) => ({ id, navn })).sort((a, b) =>
      a.navn.localeCompare(b.navn, 'nb')
    )
  }, [avdelingTables])

  const filteredStatistikk = useMemo(() => {
    let data = statistikk
    if (selectedAvdeling && avdelingTables.length > 0) {
      let tables = avdelingTables
      if (selectedSeksjon) {
        tables = tables.filter((t) => t.seksjoner?.some((s) => s.nomSeksjonId === selectedSeksjon))
      }
      const dokIds = new Set(tables.map((t) => t.etterlevelseDokumentasjonId))
      data = data.filter((s) => dokIds.has(s.etterlevelseDokumentasjonId))
    }
    return data
  }, [statistikk, selectedAvdeling, avdelingTables, selectedSeksjon])

  const temaStats = useMemo(
    () =>
      computeTemaStats(filteredStatistikk, (code) =>
        code === 'Ingen' ? 'Uten tema' : utils.getShortname(EListName.TEMA, code)
      ),
    [filteredStatistikk, utils]
  )

  const filteredTemaStats = selectedTema
    ? temaStats.filter((s) => s.temaCode === selectedTema)
    : temaStats

  return (
    <PageLayout
      pageTitle='Status pr. tema'
      currentPage='Status pr. tema'
      breadcrumbPaths={[{ href: '/dashboard', pathName: 'Dashboard' }]}
    >
      <div className='flex justify-between items-center mt-4'>
        <Heading size='large' level='1'>
          Status pr. tema
        </Heading>
      </div>

      <LocalAlert status='announcement' className='mt-4'>
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

      <Heading size='medium' level='2' className='mt-6'>
        Tema
      </Heading>

      <div className='flex gap-4 mt-4 items-end'>
        <Select
          label='Velg tema'
          className='w-fit min-w-64'
          value={selectedTema}
          onChange={(e) => setSelectedTema(e.target.value)}
        >
          <option value=''>Alle temaer</option>
          {temaStats.map((t) => (
            <option key={t.temaCode} value={t.temaCode}>
              {t.temaName}
            </option>
          ))}
        </Select>

        <Select
          label='Filtrer etter avdeling'
          className='w-fit min-w-64'
          value={selectedAvdeling}
          onChange={(e) => {
            setSelectedAvdeling(e.target.value)
            setSelectedSeksjon('')
          }}
        >
          <option value=''>Alle avdelinger</option>
          {avdelinger.map((a) => (
            <option key={a.avdelingId} value={a.avdelingId}>
              {a.avdelingNavn}
            </option>
          ))}
        </Select>

        {selectedAvdeling && seksjoner.length > 0 && (
          <Select
            label='Filtrer etter seksjon'
            className='w-fit min-w-64'
            value={selectedSeksjon}
            onChange={(e) => setSelectedSeksjon(e.target.value)}
          >
            <option value=''>Alle seksjoner</option>
            {seksjoner.map((s) => (
              <option key={s.id} value={s.id}>
                {s.navn}
              </option>
            ))}
          </Select>
        )}

        <Button
          variant='tertiary'
          size='small'
          icon={<DownloadIcon aria-hidden />}
          onClick={() => exportToCsv(filteredTemaStats)}
          disabled={isLoading || filteredTemaStats.length === 0}
        >
          Last ned CSV
        </Button>
      </div>

      {isLoading && (
        <div className='mt-8'>
          <CenteredLoader />
          <BodyShort className='text-center text-gray-500 mt-2'>
            Henter statistikk, dette kan ta litt tid...
          </BodyShort>
        </div>
      )}

      {!isLoading && (
        <Tabs className='mt-4' defaultValue='figurer'>
          <Tabs.List>
            <Tabs.Tab value='figurer' label='Vis figurer' />
            <Tabs.Tab value='nokkeltall' label='Vis nøkkeltall' />
          </Tabs.List>

          <Tabs.Panel value='figurer'>
            <div className='flex flex-col gap-6 mt-6'>
              {filteredTemaStats.map((stats) => (
                <TemaStatsCard key={stats.temaCode} stats={stats} />
              ))}
              {filteredTemaStats.length === 0 && (
                <BodyShort className='text-gray-500'>Ingen data for valgt filter</BodyShort>
              )}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value='nokkeltall'>
            <div className='flex flex-col gap-6 mt-6'>
              {filteredTemaStats.map((stats) => (
                <TemaStatsKeyMetrics key={stats.temaCode} stats={stats} />
              ))}
              {filteredTemaStats.length === 0 && (
                <BodyShort className='text-gray-500'>Ingen data for valgt filter</BodyShort>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      )}
    </PageLayout>
  )
}

export default TemaDashboardPage
